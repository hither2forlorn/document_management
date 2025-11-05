import { SettingOutlined } from "@ant-design/icons";

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}
export const items = [
  getItem("", "sub1", <SettingOutlined />, [
    getItem(
      "Select Watermark Position",
      null,
      null,
      [
        getItem("Center(default)", "1"),
        getItem("Top Right", "2"),
        getItem("Top Left", "3"),
        getItem("Bottom Right", "4"),
        getItem("Bottom Left", "5"),
        getItem("Diagonal", "6"),
      ],
      "group"
    ),
  ]),
];
