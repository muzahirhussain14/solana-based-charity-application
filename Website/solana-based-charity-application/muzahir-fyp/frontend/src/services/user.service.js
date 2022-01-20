import BASE_URL from "../utils/common";

export const login = async (body) => {
  try {
    let promise = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let response = await promise.json();
    return response;
  } catch (error) {
    return [];
  }
};

export const signup = async (body) => {
  try {
    let promise = await fetch(`${BASE_URL}/user`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let response = await promise.json();
    return response;
  } catch (error) {
    return [];
  }
};

export const getAllUsers = async () => {
  try {
    let promise = await fetch(`${BASE_URL}/user`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    let response = await promise.json();
    return response;
  } catch (error) {
    return [];
  }
};

export const getAllTransactions = async () => {
  try {
    let promise = await fetch(`${BASE_URL}/transaction`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    let response = await promise.json();
    return response;
  } catch (error) {
    return [];
  }
};

export const createTransaction = async (body) => {
  try {
    let promise = await fetch(`${BASE_URL}/account/fund`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let response = await promise.json();
    return response;
  } catch (error) {
    return [];
  }
};

export const getStatesVariable = async (body) => {
  try {
    let promise = await fetch(`${BASE_URL}/getstatesvariable`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });
    let response = await promise.json();
    return response
  } catch (error) {
    return [];
  }
};

export const setStatesVariable = async (body) => {
  try {
    let promise = await fetch(`${BASE_URL}/setstatesvariable`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
    });
    let response = await promise.json();
    return response;
  }
  catch (error) {
    return [];
  }
}

export const getStatesAccountData = async (body) => {
  try {
    let promise = await fetch(`${BASE_URL}/states`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    let response = await promise.json();
    return response;
  } catch (error) {
    return [];
  }
};

export const forwardfunds = async (body) => {
  try {
    let promise = await fetch(`${BASE_URL}/forwardfunds`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
    });

    let response = await promise.json();
    return response;
  } catch (error) {
    return [];
  }
};