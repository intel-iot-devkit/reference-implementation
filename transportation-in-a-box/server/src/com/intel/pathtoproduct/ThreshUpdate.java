package com.intel.pathtoproduct;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.intel.pathtoproduct.interfaces.IThresholdUpdateSink;

public class ThreshUpdate extends HttpServlet {
    /**
     *
     */
    private static final long serialVersionUID = 1L;

    IThresholdUpdateSink em;
    public ThreshUpdate(IThresholdUpdateSink em) {
        this.em = em;
    }

    @Override
    protected void doGet(HttpServletRequest req,
            HttpServletResponse resp) throws ServletException,
            IOException {
        /* Try to update threshold and reply with newly set threshold */
        ServletOutputStream out = resp.getOutputStream();
        String thresh = req.getParameter("value");
        if (thresh != null && !thresh.isEmpty()) {
            try {
                em.thresholdUpdateFahrenheit(Integer.valueOf(thresh));
            } catch (NumberFormatException e) {
                e.printStackTrace();
            }
        }
        
        out.write(String.format("[{\"threshold\": %f}]",
                em.getThresholdFahrenheit()).getBytes());
        out.flush();
        out.close();
    }
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        doGet(req, resp);
    }
}
