import React from "react";
import API from "../api";
import { withRouter } from "react-router-dom";
import { TagCloud as Tag } from "react-tagcloud";

const customRenderer = (tag, size, color) => (
  <div
    className="tag-cloud-item"
    id={"tag-cloud-item-" + tag.key}
    key={tag.key}
    style={{
      fontSize: `${(size / 50) * 2}em`,
      margin: "3px",
      color: color,
      padding: "5px",
      cursor: "pointer",
      display: "inline-block",
    }}
  >
    {tag.value}
  </div>
);
class TagCloud extends React.Component {
  state = {
    tagCloud: [
      {
        count: 153,
        key: 1,
        value: "Loan document",
        securityLevel: "1",
        color: "#1202d2",
      },
      {
        count: 100,
        key: 2,
        value: "Credit Document",
        securityLevel: "1",
        color: "#1202d2",
      },
      {
        count: 50,
        key: 3,
        value: "अद्फ्स्द्फ ",
        securityLevel: "1",
        color: "#ff8000",
      },
    ],
  };

  componentDidMount() {
    // return;
    //GET TAG CLOUD INFO ERROR IN API
    API.getTagCloud((err, data) => {
      if (err) return;
      if (data.success) {
        this.setState({
          tagCloud: data.data,
        });
      } else {
        console.log(data.message);
      }
    });
  }

  render() {
    return (
      <div className="row" style={{ textAlign: "center" }}>
        <Tag
          tags={this.state.tagCloud}
          renderer={customRenderer}
          maxSize={70}
          minSize={30}
          onClick={(tag) => this.props.history.push("/documents/view/" + tag.key)}
        />
      </div>
    );
  }
}

export default withRouter(TagCloud);
