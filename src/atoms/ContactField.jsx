import React, { useState, useEffect, useRef } from "react";
import { Autocomplete, TextField, Box, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function ContactField({ ZOHO, onSelectionChange }) {
  const [contacts, setContacts] = useState([]); // Contacts fetched from Zoho CRM
  const [selectedParticipants, setSelectedParticipants] = useState([]); // Selected contacts
  const [inputValue, setInputValue] = useState(""); // Search input value
  const [notFoundMessage, setNotFoundMessage] = useState(""); // Not found message
  const [loading, setLoading] = useState(false); // Loading state for search
  const debounceTimer = useRef(null); // Ref for debounce timer

  // Handle search using ZOHO.CRM.API.searchRecord
  const handleSearch = async (query) => {
    setLoading(true);
    setNotFoundMessage("");

    if (query.trim()) {
      try {
        const searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "word",
          Query: query.trim(),
        });

        if (searchResults.data && searchResults.data.length > 0) {
          // Format and set contacts
          const formattedContacts = searchResults.data.map((contact) => ({
            Full_Name:
              contact.Full_Name ||
              `${contact.First_Name || ""} ${contact.Last_Name || ""}`.trim(),
            Email: contact.Email || "No Email",
            id: contact.id,
          }));

          setContacts(formattedContacts);
          setNotFoundMessage("");
        } else {
          setContacts([]);
          setNotFoundMessage(`"${query}" not found in the database.`);
        }
      } catch (error) {
        console.error("Error during search:", error);
        setNotFoundMessage(
          "An error occurred while searching. Please try again."
        );
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleInputChangeWithDebounce = (event, newInputValue) => {
    setInputValue(newInputValue);
    setNotFoundMessage("");

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (newInputValue.trim()) {
        handleSearch(newInputValue);
      }
    }, 500); // 500ms debounce
  };

  const handleSelectionChange = (event, newValue) => {
    setSelectedParticipants(newValue);

    // Pass the selected contacts to the parent component
    onSelectionChange(newValue);
  };

  return (
    <Box display="flex" alignItems="flex-start" gap={1} sx={{ width: "100%" }}>
      <Autocomplete
        multiple
        fullWidth
        options={contacts}
        getOptionLabel={(option) => {
          const fullName = option.Full_Name || "No Name";
          return `${fullName}`;
        }}
        value={selectedParticipants}
        onChange={handleSelectionChange}
        inputValue={inputValue}
        onInputChange={handleInputChangeWithDebounce}
        loading={loading}
        noOptionsText={
          notFoundMessage ? (
            <Box display="flex" alignItems="center" color="error.main">
              <ErrorOutlineIcon sx={{ mr: 1 }} />
              <Typography variant="body2">{notFoundMessage}</Typography>
            </Box>
          ) : (
            "No options"
          )
        }
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            variant="outlined"
            label="Search Contacts"
            placeholder="Type to search by full name..."
          />
        )}
      />
    </Box>
  );
}
