package com.liferay.jsonObject;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Solicitud {
	private String type, subType, value, comment;

	public String getType() { return type; }
	public void setType(String type) { this.type = type; }
	public String getSubType() { return subType; }
	public void setSubType(String subType) { this.subType = subType; }
	public String getValue() { return value; }
	public void setValue(String value) { this.value = value; }
	public String getComment() { return comment; }
	public void setComment(String comment) { this.comment = comment; }
}