// AppInsights.js
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { ReactPlugin, withAITracking } from '@microsoft/applicationinsights-react-js'
import { globalHistory } from "@reach/router"

const reactPlugin = new ReactPlugin();
const ai = new ApplicationInsights({
    config: {
        instrumentationKey: "38354ab7-5e2c-4c70-956b-b9fcfc4506e8",
        extensions: [reactPlugin],
        extensionConfig: {
            [reactPlugin.identifier]: { history: globalHistory }
        }
    }
})
ai.loadAppInsights()

export default (Component:any) => withAITracking(reactPlugin, Component)
export const appInsights = ai.appInsights

/**
 * Handles event tracking for interactions
 * @param eventName Name of the event to send to appInsights
 * @param properties Custom properties to include in the event data
 */
export async function logEvent(eventName: string, properties: Object) {
    appInsights.trackEvent({ name: eventName, properties: properties });
}