export default async function submitJob(data, url) {
  // summary:
  //      submits a job to a gp service
  // data: {}
  // url: String
  // returns: Deferred
  console.log('submitJob');

  const params = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  try {
    const response = await fetch(url + '/execute?f=json', params);
    const responseJson = await response.json();

    if (responseJson.error) {
      throw new Error(responseJson.error);
    } else {
      return true;
    }
  } catch (error) {
    throw new Error(error);
  }
}
