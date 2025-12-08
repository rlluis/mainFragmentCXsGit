# Repeatable JSON Field Fragment

This fragment provides a repeatable form field that can be used to generate multiple entries of a given structure. In this sample, we are creating a grid (a table) and on each row we are storing Type, SubType and Comment having Type and Subtype defined by a Picklist each. We can add, delete, edit, etc. each row on the grid. 

Once submitted the idea is to store this as a JSON in an Object, so you will need to map this field to a TEXT like field in your Object. With that in mind, you can also add an Action to the object to call the "from-json-to-object-springboot" on after add. That will process the JSON and convert it into real entries of a related object and finally deleting its content so it doesn't get created again. See this CX for more details.