import { Amplify } from "aws-amplify";
import { auth_config } from "./config/aws_exports";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Operations from "Operations";

Amplify.configure(auth_config);

function App() {
  return (
    <div className="App">
      <Operations />
    </div>
  );
}

export default withAuthenticator(App, { loginMechanisms: ["username"] });
