# Orchestrator

The orchestrator service monitors traffic and availability on each of the application runner nodes.  If a node is down or experiencing high traffic it's job is seek out a new node (if available) and ask the packaging service to populate that node with a new copy of that application. 
