/**
 *
 * @param data gets array  data
 * @returns
 */

type rowType = {
  serial: number;
};

const handleSerialNumber = (data: []) => {
  const res = data.map((row: rowType, index) => {
    row.serial = index + 1;
    return row;
  });

  return res;
};

export default handleSerialNumber;
