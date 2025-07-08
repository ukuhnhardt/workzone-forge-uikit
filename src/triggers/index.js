import api, {fetch as forgeFetch, route} from "@forge/api";
import {invokeRemote} from "@forge/api";


async function mergeAsUserByAccountId(workspace, repository, pullRequest) {
  const ACCOUNT_ID = process.env["ACCOUNT_ID"] ?? "557058:de2deb41-6382-4be7-aa31-4adf2439211f";
  console.log("mergeAsUserByAccountId: ACCOUNT_ID", ACCOUNT_ID);
  const memberPermissions = await api.asApp().requestBitbucket(route`/2.0/workspaces/${workspace.uuid}/permissions`)
  console.log("memberPermissions", JSON.stringify(await memberPermissions.json(), null, 2));
  const mergeResponse = await api.asUser(ACCOUNT_ID).requestBitbucket(
    route`/2.0/repositories/${workspace.uuid}/${repository.uuid}/pullrequests/${pullRequest.id}/merge`, {
      method: 'POST',
      body: `{"type" : ""}`,
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Basic ${upw}`
      }
    })
  const data = await mergeResponse.json();
  const status = mergeResponse.status;
  console.log("mergePullRequest:asApp mergeResponse data", status, mergeResponse.statusText, JSON.stringify(data, null, 2));

}

export const pullRequestTriggerHandler = async (event, context) => {
  console.log("pullRequestTriggerHandler: event", event.eventType, JSON.stringify(event, null, 2));
  const { workspace, repository, pullrequest } = event;
  // await checkMergeRestrictionsInternalApi(workspace, repository, pullrequest);
  
  await mergeAsUserByAccountId(workspace, repository, pullrequest);
}

async function checkMergeRestrictionsInternalApi(workspace, repository, pullrequest) {
  console.log("pullRequestTriggerHandler: merge restrictions url", `/!api/internal/repositories/${workspace.uuid}/${repository.uuid}/pullrequests/${pullrequest.id}/merge-restrictions`);
  const mergeChecks = await api.asApp().requestBitbucket(route`/!api/internal/repositories/${workspace.uuid}/${repository.uuid}/pullrequests/${pullrequest.id}/merge-restrictions`)
  console.log("pullRequestTriggerHandler: merge-restrictions", mergeChecks);
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
