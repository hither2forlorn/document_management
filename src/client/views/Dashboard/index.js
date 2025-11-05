import React from "react";
import { Container } from "reactstrap";
import MemoForm from "./MemoList";
import MemoList from "../Memo/MemoList";

const Dashboard = (props) => {
  return (
    <Container className="my-4">
      <MemoForm />
      <MemoList />
    </Container>
  );
};

export default Dashboard;
