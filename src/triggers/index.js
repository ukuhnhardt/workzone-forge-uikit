import api, {fetch as forgeFetch, route} from "@forge/api";
import {invokeRemote} from "@forge/api";

export const pullRequestTriggerHandler = async (event, context) => {
  console.log("pullRequestTriggerHandler: event", event.eventType, JSON.stringify(event, null, 2));
  const { workspace, repository, pullrequest } = event;
  console.log("pullRequestTriggerHandler: merge checks url", `/!api/internal/repositories/${workspace.uuid}/${repository.uuid}/pullrequests/${pullrequest.id}/merge-restrictions`);
  const mergeChecks = await api.asApp().requestBitbucket(route`/!api/internal/repositories/${workspace.uuid}/${repository.uuid}/pullrequests/${pullrequest.id}/merge-restrictions`)
  console.log("pullRequestTriggerHandler: mergeChecks", mergeChecks);
  if (mergeChecks.status < 400) {
    return;
  }
  let upw = btoa(`${process.env["USERN"]}:${process.env["PASSW"]}`);
  console.log("upw", upw, `${process.env["USERN"]}:${process.env["PASSW"]}`);
  console.log("get PR merge restrictions:basicAuth trying forge-fetch basic auth");
  let response = await forgeFetch(`https://bitbucket.org/!api/internal/repositories/${workspace.uuid}/${repository.uuid}/pullrequests/${pullrequest.id}/merge-restrictions`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${upw}`,
    },
    redirect: 'follow'
  })
  let data = await response.text();
  let status = response.status;
  console.log("get pullrequest merge restrictions:forge-fetch:basicauth resp data", status, response.statusText, data);


  response = await invokeRemote("wz-ace-app", {
    path: `/api/forge/merge-check/${workspace.uuid}/${repository.uuid}/${pullrequest.id}`,
    // path: `/health-check`,
    method: "GET",
  })

  console.log("get pullrequest merge restrictions:remote resp data", response.status, response.statusText);

  if (!response.ok) {
    throw new Error(`invokeRemote failed: ${response.status}`);
  }

  const json = await response.json();
  console.log(`WZ ACE remote merge-checks: ${JSON.stringify(json)}`);
}
