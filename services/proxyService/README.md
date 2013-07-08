# Proxy Service

The proxy service is the router for all incoming requests for an application.  It accepts that request and passes it on to the lowest trafficed instance available (if a virgin request) or to the instance that previously handled it's request.  It is similar to an HAProxy combined with apache VHosts capabilities.
