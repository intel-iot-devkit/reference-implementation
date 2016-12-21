package com.intel.pathtoproduct.developer;
/*
 * Author: Petre Eftime <petre.p.eftime@intel.com>
 * Copyright (c) 2015 Intel Corporation.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

/**
 * This class is used to find a usable IP address for the device.
 * 
 * @author Petre Eftime <petre.p.eftime@intel.com>
 *
 */
public class IPFilter {

    boolean netStatus = false;
    boolean ipStatus = false;

    List<byte[]> filterRules = new ArrayList<byte[]>();

    /**
     * 
     * Checks if an IP address is valid to use.
     * 
     * @param ip The IP address to check against the rules.
     * @return True if the IP address is valid to use.
     */
    public boolean checkIP(byte[] ip) {
        for (byte[] sbytes : filterRules) {
            boolean match = true;
            for (int i = 0; i < 4; i++) {
                if ((sbytes[i] & ip[i]) != sbytes[i]) {
                    match = false;
                    break;
                }
            }
            if (match == true) {
                return false;
            }
        }

        return true;
    }

    /**
     * Adds a filter rule.
     * 
     * @param ip The IP address or network to remove from the list.
     */
    public void removeNetwork(String ip) {
        String[] sbytes = ip.split("\\.");
        if (sbytes.length != 4)
            return;
        byte[] bytes = new byte[sbytes.length];

        for (int i = 0; i < sbytes.length; i++) {
            short conv = Short.valueOf(sbytes[i]);
            bytes[i] = (byte) conv;
        }
        filterRules.add(bytes);
    }

    /**
     * Returns a list of IP addresses configured on the interfaces of this device and
     * matching the filter rules.
     * 
     * @return A list of useable IP addresses, conforming to the filter rules.
     * @throws SocketException
     */
    public List<Inet4Address> getIPs() throws SocketException {
        netStatus = false;
        ipStatus = false;

        ArrayList<Inet4Address> list = new ArrayList<Inet4Address>();


        Enumeration<NetworkInterface> ifaces = NetworkInterface.getNetworkInterfaces();
        while (ifaces.hasMoreElements() && ipStatus == false) {
            NetworkInterface iface = ifaces.nextElement();
            Enumeration<InetAddress> addresses = iface.getInetAddresses();
            while (addresses.hasMoreElements() && ipStatus == false) {
                InetAddress address = addresses.nextElement();
                if (!(address instanceof Inet4Address))
                    continue;

                byte[] ip = address.getAddress();
                if (checkIP(ip)) {
                    list.add((Inet4Address)address);
                }
            }
        }

        return list;
    }


    public IPFilter() {

    }
}
