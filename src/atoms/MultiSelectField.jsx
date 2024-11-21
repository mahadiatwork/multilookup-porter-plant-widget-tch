import React, { useState, useEffect, useRef } from "react";
import { Autocomplete, TextField, Box, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function MultiSelectField({ ZOHO, entity, query, label, onSelectionChange }) {
  const [options, setOptions] = useState([]); // Options fetched from Zoho CRM
  const [selectedItems, setSelectedItems] = useState([]); // Selected items
  const [inputValue, setInputValue] = useState(""); // Search input value
  const [notFoundMessage, setNotFoundMessage] = useState(""); // Not found message
  const [loading, setLoading] = useState(false); // Loading state for search
  const debounceTimer = useRef(null); // Ref for debounce timer

  // Fetch initial data on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: entity,
          Type: "criteria",
          Query: query,
        });

        if (searchResults.data && searchResults.data.length > 0) {
          const formattedOptions = searchResults.data.map((item) => ({
            id: item.id,
            name: item.Account_Name || "No Name",
            phone: item.Phone || "No Phone",
          }));

          setOptions((prevOptions) => [...prevOptions, ...formattedOptions]); // Add fetched data to options
        } else {
          setOptions([]);
          setNotFoundMessage("No initial data found.");
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setNotFoundMessage("An error occurred while fetching initial data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [ZOHO, entity, query]);

  // Handle input search
  const handleSearch = async (queryValue) => {
    setLoading(true);
    setNotFoundMessage("");

    if (queryValue.trim()) {
      try {
        const searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: entity,
          Type: "criteria",
          Query: query.replace("QUERY_VALUE", queryValue.trim()),
        });

        if (searchResults.data && searchResults.data.length > 0) {
          const formattedOptions = searchResults.data.map((item) => ({
            id: item.id,
            name: item.Account_Name || "No Name",
            phone: item.Phone || "No Phone",
          }));

          setOptions((prevOptions) => [...new Set([...prevOptions, ...formattedOptions])]); // Avoid duplicates
          setNotFoundMessage("");
        } else {
          setNotFoundMessage(`"${queryValue}" not found in the database.`);
        }
      } catch (error) {
        console.error("Error during search:", error);
        setNotFoundMessage("An error occurred while searching. Please try again.");
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
    setSelectedItems(newValue);
    onSelectionChange(newValue); // Notify parent of updated selection
  };

  return (
    <Box display="flex" alignItems="flex-start" gap={1} sx={{ width: "100%" }}>
      <Autocomplete
        multiple
        fullWidth
        options={options}
        getOptionLabel={(option) => `${option.name} (${option.phone})`}
        value={selectedItems}
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
            label={label}
            placeholder={`Type to search ${label.toLowerCase()}...`}
          />
        )}
      />
    </Box>
  );
}
