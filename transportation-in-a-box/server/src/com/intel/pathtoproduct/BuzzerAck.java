package com.intel.pathtoproduct;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class BuzzerAck extends HttpServlet {
    /**
     *
     */
    private static final long serialVersionUID = 1L;
    EventManager em;

    public BuzzerAck(EventManager em) {
        this.em = em;
    }

    @Override
    protected void doGet(HttpServletRequest req,
            HttpServletResponse resp) throws ServletException,
            IOException {
        /* Mute alarm and reply with result */
        em.alarmMuted();
        resp.getOutputStream().write("[{\"buzzer_status\": \"off\"}]".getBytes());
        resp.getOutputStream().flush();
        resp.getOutputStream().close();
    }
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        doGet(req, resp);
    }
}
