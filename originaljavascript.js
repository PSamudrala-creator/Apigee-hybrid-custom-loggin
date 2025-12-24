/* =========================
   Helper Functions
========================= */

function num(v) {
    return v ? Number(v) : null;
}

function iso(ts) {
    return ts ? new Date(Number(ts)).toISOString() : "Not Available";
}

function diff(end, start) {
    return (end && start) ? Math.floor(Number(end) - Number(start)) : null;
}

/* =========================
   Fetch Hybrid Timestamps
========================= */

// Client
var clientReqStart = num(context.getVariable("client.received.start.timestamp"));
var clientReqEnd   = num(context.getVariable("client.received.end.timestamp"));

// Target (Hybrid supported)
var targetReqStart = num(context.getVariable("target.sent.start.timestamp"));
var targetReqEnd   = num(context.getVariable("target.sent.end.timestamp"));
var targetResStart = num(context.getVariable("target.received.start.timestamp"));
var targetResEnd   = num(context.getVariable("target.received.end.timestamp"));

// System
var sysTs = num(context.getVariable("system.timestamp"));

/* =========================
   Total Transaction Time
========================= */

var totalTimeMs = diff(sysTs, clientReqStart);
context.setVariable("TotalTime", totalTimeMs ? totalTimeMs + " ms" : "Not Available");
context.setVariable("TotalTime_ms", totalTimeMs);

/* =========================
   Target Time
========================= */

var totalTargetMs = diff(targetResEnd, targetReqStart);
context.setVariable("TotalTargetTime",
    totalTargetMs ? totalTargetMs + " ms" : "Not Available");
context.setVariable("TotalTargetTime_ms", totalTargetMs);

context.setVariable("TargetRequestStartTime", iso(targetReqStart));
context.setVariable("TargetResponseEndTime", iso(targetResEnd));

/* =========================
   Proxy Time
   (client → target gap + target → client gap)
========================= */

var proxyReqGap = (targetReqStart && clientReqEnd) ? targetReqStart - clientReqEnd : null;
var proxyResGap = (sysTs && targetResEnd) ? sysTs - targetResEnd : null;

var totalProxyMs =
    (proxyReqGap !== null && proxyResGap !== null)
        ? proxyReqGap + proxyResGap
        : null;

context.setVariable("TotalProxyTime",
    (totalProxyMs !== null && totalProxyMs >= 0)
        ? totalProxyMs + " ms"
        : "Not Available");

context.setVariable("TotalProxyTime_ms", totalProxyMs);

/* =========================
   MTLS Flags (Hybrid)
========================= */

context.setVariable("BackendMTLSEnabled",
    context.getVariable("target.ssl.enabled") === "true");

context.setVariable("ClientMTLSEnabled",
    context.getVariable("client.ssl.enabled") === "true");

/* =========================
   Target Server Name (Hybrid)
========================= */

context.setVariable(
    "targetServerName",
    context.getVariable("loadbalancing.targetserver") || "NA"
);

/* =========================
   Developer App
========================= */

context.setVariable(
    "DeveloperAppName",
    context.getVariable("developer.app.name") || "NA"
);

/* =========================
   Content Length (Hybrid)
========================= */

var reqLen = num(context.getVariable("client.received.content.length"));
var resLen = num(context.getVariable("target.received.content.length"));

context.setVariable(
    "RequestContentLength",
    reqLen ? (reqLen / 1024).toFixed(2) + " KB" : "0"
);

context.setVariable(
    "ResponseContentLength",
    resLen ? (resLen / 1024).toFixed(2) + " KB" : "0"
);

/* =========================
   Error Content (JSON safe)
========================= */

var errCT = context.getVariable("error.header.content-type");
var errPayload = context.getVariable("error.content");

if (errCT && errCT.indexOf("json") >= 0 && errPayload) {
    context.setVariable("ErrorContent", errPayload);
} else {
    context.setVariable("ErrorContent", "\"NA\"");
}

/* =========================
   Target Base Path
========================= */

var targetUrl = context.getVariable("target.url");
var pathSuffix = context.getVariable("proxy.pathsuffix") || "";

if (targetUrl && pathSuffix) {
    var regex = new RegExp("^https?://[^/]+(/[^?#]*)" + pathSuffix.replace(/\//g, "\\/"));
    var match = targetUrl.match(regex);
    context.setVariable("capturedTargetpath", match ? match[1] : "NA");
}

/* =========================
   logObj default
========================= */

if (!context.getVariable("logObj")) {
    context.setVariable("logObj", "\"NA\"");
}

/* =========================
   Request End Time
========================= */

context.setVariable("RequestEndTime", iso(sysTs));
