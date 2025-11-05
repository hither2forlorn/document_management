## Vendor function

```
const banks = {
rbb: {
name: "rbb",
fullName: "Rastriya Banijya Bank",
domain: "rbb.com.np",
feautres: [],
excludedFeatures: [],
},
bok: {
name: "bok",
fullName: "Bank of Kathmandu",
domain: "bok.com.np",
feautres: [],
excludedFeatures: [],
},
citizen: {
name: "citizen",
fullName: "Citizen Bank",
domain: "ctznbank.com",
feautres: [],
excludedFeatures: [],
},
};

```

```
// Only include feature for this vendor
function onlyForThisVendor(bank) {
vendor = false;
<!-- Check if type of parameter is object-->
if (typeof bank == "object") {
   <!-- Loop to check if bank is equal or not, if the bank is equal then it returns true. -->
for (i = 0; i < bank.length; i++) {
vendor = bank[i] == selectedVendor;
if (vendor == true) return true;
}
} else vendor = selectedVendor === bank;

return vendor;
}

```

```
function excludeThisVendor(bank) {

vendor = false;
<!-- Check if type of parameter is object-->
if (typeof bank == "object") {
   <!-- Loop to check if bank is equal or not, if vendor bank is not equal to selectedVendor then it return false -->
for (i = 0; i < bank.length; i++) {
vendor = bank[i] != selectedVendor;
if (vendor == false) return false;
}
} else vendor = selectedVendor !== bank;

return vendor;
}

```

# Select Vendor Docs

1. **onlyForThisVendor**
   this function checks the type of bank which if equals to object runs an iteration upto the bank.length which means if bank = [rbb,bok,citizen] then the loop ran three times
   then if the selected vendor or vendor declared in the env file is equal to the bank[i] meaning either rbb, bok or citizen as declared in bank returns true.

2. **ExcludeForThisVendor**
   this function checks the type of bank which if equals to object runs an iteration upto the bank.length which means if bank = [rbb,bok,citizen] the loop is ran three times
   then if the selected vendor or vendor declared in the env file isnot equal to the bank[i] meaning either rbb, bok or citizen as declared in bank returns false.
