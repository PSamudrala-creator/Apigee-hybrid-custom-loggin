var logData = {
  timestamp: context.getVariable("system.time"),
  proxy: context.getVariable("apiproxy.name"),
  flow: context.getVariable("flow.name"),
  correlationId: context.getVariable("x-apigee-correlation-id"),
  statusCode: context.getVariable("response.status.code"),
  targetTime: context.getVariable("target.response.time"),
  totalTime: context.getVariable("system.total.response.time"),
  fault: {
    name: context.getVariable("fault.name"),
    policy: context.getVariable("fault.policy.name")
  }
};

context.setVariable("splunk.log.message", JSON.stringify(logData));
