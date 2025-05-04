const fs = require("fs").promises;
const path = require("path");

const DIR_PATH = path.join(__dirname, "..", "data", "music");
const SORT_KEYS = ["channel", "release_year", "album", "title"];

function compareData(a, b) {
  for (const key of SORT_KEYS) {
    // Check if the key exists in both objects
    const aVal = a[key];
    const bVal = b[key];

    // Handle null or undefined consistently: null/undefined come first.
    const aIsNull = aVal == null;
    const bIsNull = bVal == null;
    if (aIsNull && bIsNull) continue;
    if (aIsNull) return -1;
    if (bIsNull) return 1;

    // Compare the values
    let comparison = 0;
    if (key === "release_year") {
      const numA = Number(aVal);
      const numB = Number(bVal);
      const aIsNaN = isNaN(numA);
      const bIsNaN = isNaN(numB);

      // Handle NaN values: treat them as larger than any number
      if (aIsNaN && bIsNaN) {
        comparison = 0;
      } else if (aIsNaN) {
        comparison = 1;
      } else if (bIsNaN) {
        comparison = -1;
      } else {
        // Sort years descending
        comparison = numB - numA;
      }
    } else if (typeof aVal === "string" && typeof bVal === "string") {
      // Case-insensitive string comparison
      comparison = aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
    } else {
      // Generic comparison for other types (e.g., numbers, booleans)
      if (aVal < bVal) comparison = -1;
      else if (aVal > bVal) comparison = 1;
    }

    // If the comparison is not zero, return it
    if (comparison !== 0) {
      return comparison;
    }
  }

  // All keys are equal
  return 0;
}

async function processFile(fPath, fName) {
  // Read the file and parse JSON
  let data;
  try {
    const content = await fs.readFile(fPath, "utf-8");
    data = JSON.parse(content);
  } catch (err) {
    console.error(`Error reading/parsing file ${fName}:`, err.message);
    return;
  }

  // Safely access items using optional chaining
  const items = data?.root?.[0]?.data?.items;
  if (!Array.isArray(items)) {
    console.warn(
      `Skipping ${fName}: Expected 'root[0].data.items' not found or not an array.`
    );
    return;
  }

  // Check if items array is empty
  if (items.length === 0) {
    console.log(`Skipping ${fName}: No items to sort.`);
    return;
  }

  // Sort the array using the compareData function
  const originalItemCount = items.length;
  try {
    items.sort(compareData);
  } catch (err) {
    console.error(`Error sorting ${fName}:`, err);
    return;
  }

  // Check if item count changed after sorting
  if (originalItemCount !== items.length) {
    console.error(
      `Sort error in ${fName}: Item count changed (${originalItemCount} -> ${items.length}). Aborting write.`
    );
    return;
  }

  // Write the sorted data back to the file
  try {
    await fs.writeFile(fPath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`Saved ${fName} (${items.length} items sorted)`);
  } catch (err) {
    console.error(`Error writing ${fName}:`, err);
  }
}

// Main function
async function main() {
  // Check if the target directory is accessible
  try {
    await fs.access(DIR_PATH);
  } catch (err) {
    console.error(`Error: Directory not found or not accessible: ${DIR_PATH}`);
    process.exitCode = 1;
    return;
  }

  // Read directory contents
  let dirFiles;
  try {
    dirFiles = await fs.readdir(DIR_PATH);
  } catch (err) {
    console.error(`Error reading directory ${DIR_PATH}:`, err);
    process.exitCode = 1;
    return;
  }

  // Filter for JSON files only
  const jsonFiles = dirFiles.filter(
    (f) => path.extname(f).toLowerCase() === ".json"
  );

  // Check if there are any JSON files to process
  if (jsonFiles.length === 0) {
    console.log(`No JSON files found in ${DIR_PATH}.`);
    return;
  }

  // Process all JSON files in parallel
  console.log(`Processing ${jsonFiles.length} JSON files...`);
  await Promise.all(
    jsonFiles.map((fName) => {
      const fPath = path.join(DIR_PATH, fName);
      return processFile(fPath, fName);
    })
  );
  console.log("Finished.");
}

// Execute the main function and handle any unexpected errors
main().catch((err) => {
  console.error("An unexpected error occurred:", err);
  process.exitCode = 1;
});
