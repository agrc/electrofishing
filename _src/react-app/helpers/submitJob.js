const CHECK_INTERVAL = 500;
const headers = {
  'X-Requested-With': null,
  'Content-Type': 'application/json',
};

const checkJobStatus = async (url, jobId) => {
  console.log('checkJobStatus');

  const params = {
    method: 'POST',
    headers,
    body: JSON.stringify({ f: 'json' }),
  };

  try {
    const response = await fetch(url + '/jobs/' + jobId, params);
    const jobStatus = await response.json();

    jobStatus.messages.forEach((m) => {
      console.log(m.description);
    });

    if (jobStatus.jobStatus === 'esriJobSucceeded') {
      return true;
    } else if (jobStatus.jobStatus === 'esriJobFailed') {
      console.log('jobErr', jobStatus.messages);
      throw new Error();
    }

    return false;
  } catch (jobError) {
    throw new Error(jobError);
  }
};

const wait = (delay) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

export default async function submitJob(data, url) {
  // summary:
  //      submits a job to a gp service
  // data: {}
  // url: String
  // returns: Deferred
  console.log('submitJob');

  const params = {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  };

  try {
    const response = await fetch(url + '/submitJob', params);
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.error);
    } else {
      let checkResult = await checkJobStatus(url, responseJson.jobId);
      while (!checkResult) {
        await wait(CHECK_INTERVAL);
        checkResult = await checkJobStatus(url, responseJson.jobId);
      }
    }
  } catch (error) {
    throw new Error(error);
  }
}
