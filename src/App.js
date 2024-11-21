import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MultiSelectField from "./atoms/MultiSelectField";

const ZOHO = window.ZOHO;

const parentContainerStyle = {
  borderTop: "1px solid #BABABA",
  minHeight: "calc(100vh - 1px)",
  p: "1em",
  display: "flex",
  flexDirection: "column",
};

function App() {
  const [selectedData, setSelectedData] = React.useState({
    contacts: [],
    companies: [],
    contractors: [],
    subContractors: [],
  });

  React.useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", () => {
      console.log("Zoho Embedded App Initialized");
    });

    ZOHO.embeddedApp.init();
  }, []);

  const handleSubmit = () => {
    console.log("Selected Data for Submit:", selectedData);

    // Perform further actions with `selectedData`
  };

  return (
    <Box sx={parentContainerStyle}>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1em",
        }}
      >
        <MultiSelectField
          ZOHO={ZOHO}
          entity="Contacts"
          label="Contacts"
          query="(Full_Name:contains:QUERY_VALUE)"
          onSelectionChange={(newValue) =>
            setSelectedData((prev) => ({ ...prev, contacts: newValue }))
          }
        />
        <MultiSelectField
          ZOHO={ZOHO}
          entity="Accounts"
          label="Companies"
          query="(Account_Type:equals:Customer)"
          onSelectionChange={(newValue) =>
            setSelectedData((prev) => ({ ...prev, companies: newValue }))
          }
        />
        <MultiSelectField
          ZOHO={ZOHO}
          entity="Accounts"
          label="Contractors"
          query="(Account_Type:equals:Distributor)"
          onSelectionChange={(newValue) =>
            setSelectedData((prev) => ({ ...prev, contractors: newValue }))
          }
        />
        <MultiSelectField
          ZOHO={ZOHO}
          entity="Accounts"
          label="Sub-Contractors"
          query="(Account_Type:equals:Supplier)"
          onSelectionChange={(newValue) =>
            setSelectedData((prev) => ({ ...prev, subContractors: newValue }))
          }
        />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "1em" }}>
        <Button
          variant="outlined"
          onClick={() => {
            ZOHO.CRM.UI.Popup.close();
          }}
        >
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Box>
  );
}

export default App;
