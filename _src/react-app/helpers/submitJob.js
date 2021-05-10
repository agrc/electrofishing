export default async function submitJob(data, url) {
  // summary:
  //      submits a job to a gp service
  // data: {}
  // url: String
  // returns: Deferred
  console.log('submitJob');

  const urlSearchParams = new URLSearchParams();

  for (const prop in data) {
    urlSearchParams.append(prop, data[prop]);
  }

  const params = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: urlSearchParams,
  };

  try {
    const response = await fetch(url + '/execute?f=json', params);
    const responseJson = await response.json();

    if (responseJson.error) {
      throw new Error(JSON.stringify(responseJson.error));
    } else {
      return true;
    }
  } catch (error) {
    throw new Error(error);
  }
}
