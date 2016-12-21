package com.intel.pathtoproduct;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.intel.pathtoproduct.interfaces.IEventLog;
import com.intel.pathtoproduct.interfaces.IResetManager;

public class DataServ extends HttpServlet {
    
    /**
     *
     */
    private static final long serialVersionUID = 1L;
    IEventLog em;
    IResetManager rm;
    
    public DataServ(IEventLog em, IResetManager rm) {
        this.em = em;
        this.rm = rm;
    }
    
    @Override
    protected void doGet(HttpServletRequest req,
            HttpServletResponse resp) throws ServletException,
            IOException {
        /* return data from log or reset application data */
        ServletOutputStream out = resp.getOutputStream();
        String query = req.getParameter("value");
        if (query == null)
            return;
        
        String s = "[";
        
        if (query.equals("current")) {
            Event event = em.getLatestEvent();
            if (event != null)
                s += event.getJSON(); 
        } else if (query.equals("log")) {
            
            for (Event e : em.getEvents())
                s += e.getJSON() + ", ";
            if (s.length() > 1)
                s = s.substring(0, s.length() - 2);
        } else if (query.equals("reset")) {
            rm.reset();
        } else
            return;
        
        s += "]";

        out.write(s.getBytes());
        out.flush();
        out.close();
    }
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        doGet(req, resp);
    }
}
