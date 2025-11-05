import React, { useState, useEffect, useRef } from "react";
import {
  // Link,
  NavLink,
} from "react-router-dom";
//eslint-disable-next-line
import { UncontrolledDropdown, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem, Badge } from "reactstrap";
import PropTypes from "prop-types";
// import { getProfile } from '../../config/api';
import A from "../../config/url";
import { connect } from "react-redux";

import {
  // AppAsideToggler,
  AppNavbarBrand,
  AppSidebarToggler,
  AppSidebarMinimizer,
} from "@coreui/react";
import metaRoutes from "../../config/meta_routes";
import { getNotificationDocuments } from "admin/views/Dashboard/api/document";
import { getBankObject } from "config/bank";
import { selectedVendor, banks, onlyForThisVendor, excludeThisVendor } from "config/bank";
import { useQuery } from "react-query";
import axios from "axios";
import { useHistory} from 'react-router-dom';
const logo = "/img/epf_logo.svg";
const logoSmall = "/img/logo-small.png";

const propTypes = {
  children: PropTypes.node,
};
const asideMenuCssClasses = [
  "aside-menu-show",
  "aside-menu-sm-show",
  "aside-menu-md-show",
  "aside-menu-lg-show",
  "aside-menu-xl-show",
];



const defaultProps = {};
function toggleClasses(toggleClass, classList, force) {
  const level = classList.indexOf(toggleClass);
  const removeClassList = classList.slice(0, level);
  removeClassList.map((className) => document.body.classList.remove(className));
  if (force === true) {
    document.body.classList.add(toggleClass);
  } else if (force === false) {
    document.body.classList.remove(toggleClass);
  } else {
    document.body.classList.toggle(toggleClass);
  }
  return document.body.classList.contains(toggleClass);
}
const toggle = (force) => {
  let cssClass = asideMenuCssClasses[0];
  cssClass = "aside-menu-show";
  toggleClasses(cssClass, asideMenuCssClasses, force);
};
const asideToggle = (e) => {
  e.preventDefault();
  toggle();
};

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideAlerter(ref) {
  /**
   * Alert if clicked on outside of element
   */
  function handleClickOutside(event) {
    if (ref.current && !ref.current.contains(event.target)) {
      toggle(false);
    }
  }

  // Bind the event listener
  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    // Unbind the event listener on clean up
    document.removeEventListener("mousedown", handleClickOutside);
  };

}

function BaseHeader(props) {
  const [response, setResponse] = useState("");
  const history = useHistory();

  // const [isNotificationClicked,setIsNotificationClicked]=useState(false); 
  const isAdmin = props?.permission?.permissions?.isAdmin;
  const isMaker = props?.permission?.permissions?.maker;
  const isChecker = props?.permission?.permissions?.checker;

  const userProfile = props.userProfile;

  const { data, error } = useQuery("notificationList", () => getNotificationDocuments());

  const currentUserId = parseInt(userProfile?.id);

  const handleScanner = async () => {
    try {
      const response = await axios.get("http://172.16.5.71:8181/api/scanner", {
        responseType: "blob",
      });
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "naps2.zip";
      link.href = url;
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error(error);
    }
  };


  const handleDemoVideoClick = () => {
    const videoUrl = isAdmin? getBankObject()?.adminDemoVideos:null;
   
    if (videoUrl) {
      history.push(`/demo-videos?videos=${encodeURIComponent(JSON.stringify(videoUrl))}`);
    } else {
      alert('No demo video available for this vendor.');
    }
  };
  


  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  return (
    <React.Fragment>
      <AppSidebarToggler className="d-lg-none" display="md" mobile />
      <AppNavbarBrand
        className="app-logo"
        full={{ src: logo, width: 120, height: 25, alt: "General DMS" }}
      // minimized={{
      //   src: logoSmall,
      //   width: 30,
      //   height: 30,
      //   alt: "General DMS",
      // }}
      />
      {/* <AppSidebarToggler className="d-md-down-none" display="lg" />

        <AppSidebarMinimizer /> */}
      {/* <div className="header-logo">
        <span className="text-light font-weight-bold">PaperBank</span>
      </div> */}
      <Nav className="ml-auto" navbar>
        <UncontrolledDropdown nav direction="down">
          <DropdownToggle nav>
            <span className="img-avatar text-light d-flex align-items-center">
              <b className="mr-2">Welcome {userProfile.name}</b>
              <i className="fas fa-user-circle fa-2x" />
            </span>
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem href={"#" + metaRoutes.adminUsersView + "?i=" + A.getHash(currentUserId)}>
              <i className="fas fa-user"></i> My Profile
            </DropdownItem>
            {excludeThisVendor([banks.rbb.name]) && isAdmin ? (
              <DropdownItem onClick={isAdmin ? (e) => window.open(getBankObject()?.adminManual) : null}>
                <i className="fas fa-info-circle"></i> User Manual
              </DropdownItem>
            ) : null}

           {excludeThisVendor([banks.rbb.name]) && isAdmin ? (
              <DropdownItem onClick={handleDemoVideoClick}>
                <i className="fas fa-video"></i> Demo Videos
              </DropdownItem>
            ) : null}

            {onlyForThisVendor(banks.rbb.name) && isAdmin ? (
              <DropdownItem onClick={isAdmin ? (e) => window.open(getBankObject()?.adminManual) : null}>
                <i className="fas fa-info-circle"></i> User Manual (Admin)
              </DropdownItem>
            ) : null}

           

            {onlyForThisVendor(banks.rbb.name) && isChecker ? (
              <DropdownItem onClick={isChecker ? (e) => window.open(getBankObject()?.checkerManual) : null}>
                <i className="fas fa-info-circle"></i> User Manual (Checker)
              </DropdownItem>
            ) : null}
            {onlyForThisVendor(banks.rbb.name) && isMaker ? (
              <DropdownItem onClick={isMaker ? (e) => window.open(getBankObject()?.makerManual) : null}>
                <i className="fas fa-info-circle"></i> User Manual (Maker)
              </DropdownItem>
            ) : null}
            {!isMaker && !isChecker && !isAdmin && (
              <DropdownItem
                onClick={!isMaker && !isChecker && !isAdmin ? (e) => window.open(getBankObject()?.defaultManual) : null}
              >
                <i className="fas fa-info-circle"></i> User Manual (Default)
              </DropdownItem>
            )}
            {/* <DropdownItem onClick={handleScanner}>
              <i className="fa fa-hdd-o"></i>
              Download Scanner
            </DropdownItem> */}
            <DropdownItem onClick={(e) => props.onLogout(e)}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>

        <div ref={wrapperRef} className="aside-menu-show">
          <NavItem className="d-md-down-none">
            <NavLink to="" onClick={(event) => {
              event.stopPropagation()
              asideToggle(event)
            }}>
              <i className="fas fa-bell icons font-xl d-block text-light"></i>
              <Badge className="notification-count" pill color="danger">
                {data?.total || 0}
              </Badge>
            </NavLink>
          </NavItem>
        </div>
      </Nav>
      {/* <button type="button" className="d-md-down-none navbar-toggler">
          <span className="navbar-toggler-icon"></span>
        </button> */}
      {/* <AppAsideToggler className="d-md-down-none" /> */}
      {/*<AppAsideToggler className="d-lg-none" mobile />*/}
    </React.Fragment>
  );

}

BaseHeader.propTypes = propTypes;
BaseHeader.defaultProps = defaultProps;

export default connect((state) => ({
  userProfile: state.userProfile,
}))(BaseHeader);
