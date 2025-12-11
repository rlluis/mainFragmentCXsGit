# From JSON to Object - Spring Boot Client Extension

This is a Liferay Client Extension built with Spring Boot. It converts a JSON field on a Object into its corresponding related object by creating one object entry per each specific JSON structure found in the JSON field. Finally, it deletes the JSON field's original value so you can't accidentally re-execute it.

This has been tested against the following Objects:

 Main Object --> what ever number of Fields and one Field called "JsonSolicitudes" configured as Long Text
 Secondary Object --> a OneToMany relationship with main object. Fields: Prefijo (Text), Celula (PickList), TipoSolicitud (PickList), SubTipoSolicitud (PickList), Valor, Observaciones
 PickLists --> I have certain logic in TipoSolicitudService.java that you of course can change. If you don't change it, what I need is a picklist called TipoSolicitud and the following values: Traslados, Prestamos, Vivienda, Reconsideraciones