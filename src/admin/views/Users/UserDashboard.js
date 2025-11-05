import React, { useState, useEffect } from "react";
import UserList from "./UserList";
import { getUsers, deleteUser } from "./api";
import SearchUser from "./SearchUser";
import { toast } from "react-toastify";
import { Row, Col } from "reactstrap";
import { connect } from "react-redux";

const UserDashboard = (props) => {
  // state = {
  //   searchData: { userType: "admin" },
  //   userList: [],
  // };
  const [searchData, setSearchData] = useState({ userType: "admin" });
  const [userList, setUserList] = useState([]);

  const onSubmit = (event) => {
    event.preventDefault();
    const formData = {};
    const form = event.target;
    for (let i = 0; i < form.length; i++) {
      const name = form.elements[i].name;
      const value = form.elements[i].value;
      if (value) {
        formData[name] = value;
      }
    }
    // this.setState(
    //   {
    //     searchData: formData,
    //   },
    //   () => this.updateData()
    // );
    setSearchData({ ...formData });
    updateData();
  };

  const handleDeleteUser = (id) => {
    // user cannot delete himself
    if (props.userProfile.id === id) {
      toast.warn("You cannot delete your Self");
      return;
    }

    deleteUser(id, (err, data) => {
      if (err) return;
      if (data.success) {
        toast.success("User deleted successfully.");

        // if he delete himself
        if (id == props.userProfile.id) {
          localStorage.clear();
          window.location.reload(); //Reloads the current page
        }

        updateData();
      } else {
        toast.error(data.message);
      }
    });
  };

  const updateData = () => {
    getUsers(searchData, (err, data) => {
      if (err) return;
      // this.setState({
      //   userList: data,
      // });
      if (data) {
        data.forEach((branch, index) => {
          branch.serial = index + 1;
        });
      }
      setUserList(data);
    });
  };

  useEffect(() => {
    updateData();
  }, [searchData]);

  return (
    <Row>
      <Col sm={3}>
        <SearchUser onSubmit={onSubmit} />
      </Col>

      <Col sm={9} className="pl-3 pl-md-0">
        <UserList deleteUser={handleDeleteUser} userList={userList} {...props} />
      </Col>
    </Row>
  );
};

export default connect((state) => ({
  user: state.allFields,
  userProfile: state.userProfile,
}))(UserDashboard);
