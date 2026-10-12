package com.resumematch;

import com.resumematch.cli.DSACliApplication;
import com.resumematch.server.DSAHttpServer;

/**
 * Universal Entry Point for ResumeMatch AI (Java Edition)
 * 
 * Usage:
 *   java -cp bin com.resumematch.Main          -> Launches Interactive DSA Console CLI
 *   java -cp bin com.resumematch.Main --server -> Launches REST API Server on port 5000
 */
public class Main {
    public static void main(String[] args) throws Exception {
        if (args.length > 0 && ("--server".equalsIgnoreCase(args[0]) || "--api".equalsIgnoreCase(args[0]))) {
            DSAHttpServer.main(args);
        } else {
            DSACliApplication.main(args);
        }
    }
}
