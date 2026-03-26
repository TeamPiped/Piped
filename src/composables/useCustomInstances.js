export function getCustomInstances() {
    return JSON.parse(window.localStorage.getItem("customInstances")) ?? [];
}

export function addCustomInstance(instance) {
    let customInstances = getCustomInstances();
    customInstances.push(instance);
    window.localStorage.setItem("customInstances", JSON.stringify(customInstances));
}

export function removeCustomInstance(instanceToDelete) {
    let customInstances = getCustomInstances().filter(instance => instance.api_url != instanceToDelete.api_url);
    window.localStorage.setItem("customInstances", JSON.stringify(customInstances));
}
