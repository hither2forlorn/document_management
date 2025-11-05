import React from "react";
import { Link } from "react-router-dom";
import { VIEW } from "../../config/values";
const sidebarWidth = "210px";
const sidebarCollapseWidth = "50px";

export default class Sidebar extends React.Component {
  state = {
    sidebarCollapsed: true,
  };

  toggleMenu = (id) => {
    const element = document.getElementById(id);
    const element_style = element.style;
    const oldHeight = element_style.height;
    this.toggleOthers(id);
    const height = element.childElementCount * 30 + "px";
    if (oldHeight === height) {
      element_style.height = "0px";
    } else {
      element_style.height = height;
    }
  };

  toggleOthers(id) {
    const elements = document.getElementsByClassName("sidebar-inside-menu");
    try {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.style.height = "0px";
      }
    } catch (err) {
      console.log(err);
    }
  }

  openNav() {
    document.getElementById("sidebar").style.width = sidebarWidth;
    document.getElementById("wrapper").style.marginLeft = sidebarWidth;
    document.getElementById("navbar").style.marginLeft = sidebarWidth;
    document.getElementById("sidebar").style.textAlign = "left";
    document.getElementById("toggle-sidebar").style.textAlign = "right";
    let elements = document.getElementsByClassName("icon-description");
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.display = "inline-block";
    }
    elements = document.getElementsByClassName("sidebar-inside-menu");
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.display = "block";
    }
  }

  closeNav() {
    document.getElementById("sidebar").style.width = sidebarCollapseWidth;
    document.getElementById("wrapper").style.marginLeft = sidebarCollapseWidth;
    document.getElementById("navbar").style.marginLeft = sidebarCollapseWidth;
    setTimeout(function () {
      document.getElementById("sidebar").style.textAlign = "center";
      const elements = document.getElementsByClassName("icon-description");
      for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = "none";
      }
      const sidebarElements = document.getElementsByClassName("sidebar-inside-menu");
      for (let i = 0; i < sidebarElements.length; i++) {
        sidebarElements[i].style.display = "none";
      }
    }, 1000);
  }

  toggleNav = () => {
    if (this.state.sidebarCollapsed) {
      this.openNav();
      this.setState({

        sidebarCollapsed: false,
      });
    } else {
      this.closeNav();
      this.setState({
        sidebarCollapsed: true,
      });
    }
  };

  render() {
    const p = this.props.permissions || {};
    return (
      <div id="sidebar" className="sidenav">
        <div className="toggle-sidebar-container" id="toggle-sidebar">
          <i onClick={() => this.toggleNav()} className="fa fa-bars toggle-sidebar-button" />
        </div>
        <div style={{ margin: 0 }}>
          <div className="nav-container">
            <i className="fa fa-th fa-lg icon"></i>
            <Link className="icon-description" to="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>
        {p.user >= VIEW || p.role >= VIEW ? (
          <div style={{ margin: 0 }}>
            <div className="nav-container">
              <i className="fa fa-user fa-lg icon" />
              <span className="icon-description" onClick={() => this.toggleMenu("user-management")}>
                User Management <i className="fa fa-angle-down" />
              </span>
            </div>
            <div id="user-management" className="sidebar-inside-menu">
              {p.user >= VIEW ? (
                <Link className="icon-description" to="/users">
                  <i className="fa fa-user icon" />
                  User List
                </Link>
              ) : null}
              {p.role >= VIEW ? (
                <Link className="icon-description" to="/roles">
                  <i className="fa fa-user icon" />
                  User Roles
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
        {p.documentType >= VIEW ||
          p.documentCondition >= VIEW ||
          p.department >= VIEW ||
          p.locationMap >= VIEW ||
          p.locationType >= VIEW ||
          p.branch >= VIEW ||
          p.language >= VIEW ||
          p.watermark ? (
          <div style={{ margin: 0 }}>
            <div className="nav-container">
              <i className="fa fa-building fa-lg icon" />
              <span className="icon-description" onClick={() => this.toggleMenu("company-management")}>
                Settings <i className="fa fa-angle-down" />
              </span>
            </div>
            <div id="company-management" className="sidebar-inside-menu">
              {p.branch >= VIEW ? (
                <Link className="icon-description" to="/branches">
                  <i className="fa fa-book icon" />
                  Branches
                </Link>
              ) : null}
              {p.department >= VIEW ? (
                <Link className="icon-description" to="/departments">
                  <i className="fa fa-cube icon" />
                  Departments
                </Link>
              ) : null}
              {p.documentType >= VIEW ? (
                <Link className="icon-description" to="/document-types">
                  <i className="fa fa-file icon" />
                  Document Types
                </Link>
              ) : null}
              {p.documentCondition >= VIEW ? (
                <Link className="icon-description" to="/document-conditions">
                  <i className="fa fa-file icon" />
                  Document Condition
                </Link>
              ) : null}
              {p.locationMap >= VIEW ? (
                <Link className="icon-description" to="/location-maps">
                  <i className="fa fa-map-marker icon" />
                  Location Map
                </Link>
              ) : null}
              {p.locationType >= VIEW ? (
                <Link className="icon-description" to="/location-types">
                  <i className="fa fa-map-marker icon" />
                  Location Types
                </Link>
              ) : null}
              {p.language >= VIEW ? (
                <Link className="icon-description" to="/languages">
                  <i className="fa fa-globe icon" />
                  Language
                </Link>
              ) : null}
              {p.watermark ? (
                <Link className="icon-description" to="/watermark">
                  <i className="fa fa-image icon" />
                  Watermark
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
        {p.document >= VIEW ? (
          <div style={{ margin: 0 }}>
            <div className="nav-container">
              <i className="fa fa-file fa-lg icon"></i>
              <Link className="icon-description" to="/documents/expiring" style={{ color: "#ff6262", fontWeight: 600 }}>
                Expiring Documents
              </Link>
            </div>
          </div>
        ) : null}
        {p.document >= VIEW ? (
          <div style={{ margin: 0 }}>
            <div className="nav-container">
              <i className="fa fa-file fa-lg icon"></i>
              <Link className="icon-description" to="/documents/pending" style={{ color: "#1b8633", fontWeight: 600 }}>
                Pending Documents
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
