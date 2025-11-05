import { Menu } from "antd";
import React from "react";
import { items } from "./WatermarkConfig";

const WatermarkSettingsBasic = (props) => {
  return (
    <div>
      <div className="watermark-settings-section">
        <span className="watermarkSettings">
          <Menu
            onClick={(e) => props.handleCustomWatermark(e)}
            style={{
              backgroundColor: "transparent",
              width: 50,
              margin: "0px 0px 0px 0px",
            }}
            mode="vertical"
            items={items}
          />
        </span>
      </div>
    </div>
  );
};

export default WatermarkSettingsBasic;
