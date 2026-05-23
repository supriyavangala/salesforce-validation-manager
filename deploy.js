// deploy.js
const jsforce = require("jsforce");
const AdmZip = require("adm-zip");

async function deployValidationRule() {
  const conn = new jsforce.Connection({
    accessToken: process.env.SF_TOKEN,
    instanceUrl: process.env.SF_INSTANCE_URL,
  });

  // package.xml only references the validation rule
  const packageXml = `<?xml version="1.0" encoding="UTF-8"?>
  <Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
      <members>Account.Require_phone</members>
      <name>ValidationRule</name>
    </types>
    <version>61.0</version>
  </Package>`;

  // Validation Rule XML
  const ruleXml = `<?xml version="1.0" encoding="UTF-8"?>
  <ValidationRule xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Require_phone</fullName>
    <active>true</active>
    <errorConditionFormula>ISBLANK(Phone)</errorConditionFormula>
    <errorMessage>Phone number is required</errorMessage>
  </ValidationRule>`;

  // Build ZIP with correct structure
  const zip = new AdmZip();
  zip.addFile("unpackaged/package.xml", Buffer.from(packageXml, "utf8"));
  zip.addFile(
    "unpackaged/objects/Account/validationRules/Require_phone.validationRule",
    Buffer.from(ruleXml, "utf8"),
  );

  const zipBuffer = zip.toBuffer();

  // Deploy
  const result = await conn.metadata
    .deploy(zipBuffer, { rollbackOnError: true })
    .complete();
  console.log("Deploy result:", JSON.stringify(result, null, 2));
  console.log(
    "Failures:",
    JSON.stringify(result.details.componentFailures, null, 2),
  );
}

deployValidationRule().catch(console.error);
