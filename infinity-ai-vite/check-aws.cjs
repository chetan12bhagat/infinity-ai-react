const { LambdaClient, ListFunctionsCommand } = require('@aws-sdk/client-lambda');
const { IAMClient, ListRolesCommand } = require('@aws-sdk/client-iam');

const lambdaclient = new LambdaClient({ region: 'us-east-1' });
const iamclient = new IAMClient({ region: 'us-east-1' });

async function check() {
    try {
        const res = await lambdaclient.send(new ListFunctionsCommand({}));
        console.log("Functions:", res.Functions.map(f => f.FunctionName));

        const res2 = await iamclient.send(new ListRolesCommand({}));
        console.log("Roles:", res2.Roles.map(r => r.RoleName).filter(name => name.startsWith('infinity')));
    } catch(e) {
        console.error(e);
    }
}
check();
