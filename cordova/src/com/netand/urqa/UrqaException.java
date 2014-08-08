package com.netand.urqa;

import java.lang.Exception;
import java.io.PrintWriter;

public class UrqaException extends Exception {

	private String title;
	private String stacktrace;

	public UrqaException( String title, String stacktrace ){
		this.title = title;
		this.stacktrace = stacktrace;
	}


	@Override
	public void printStackTrace(PrintWriter s){
		s.println("UrqaException " + title /*+" "+ stacktrace */ + " :");
		s.println(stacktrace);
		s.flush();
	}



}