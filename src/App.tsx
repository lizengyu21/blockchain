import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Typography,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Collapse,
  Card,
} from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import "./App.css"; // 确保导入了CSS
import Web3 from "web3";
import ContractABI from "./abi.json";
import Panel from "antd/es/cascader/Panel";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: true;
      request: (...args: any[]) => Promise<any>;
    };
    web3?: Web3;
  }
}

// 购买保险、赔付、查看保单、查看理赔记录、查看保险产品
// 资产上链

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const contractABI = ContractABI;
// const contractAddress = "0xe75a6Eb0e0Cd2fFC24a59E5eAd87f946b1278EE9";

const CustomLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState<any>(null);
  const [contractAddress, setContractAddress] = useState<any>(null);
  const [isBuyPolicyModalVisible, setisBuyPolicyModalVisible] = useState(false);
  const [buyform] = Form.useForm();

  const [isV, setisV] = useState(false);
  const [vform] = Form.useForm();
  
  const [isCreateModalVisible, setisCreateModalVisible] = useState(false);
  const [createform] = Form.useForm();

  const [isGetModalVisible, setisGetModalVisible] = useState(false);
  const [getform] = Form.useForm();
  const [isInfModalVisible, setisInfModalVisible] = useState(false);
  const [getInfResult, setGetInfResult] = useState<any>(null);

  const [getMyInf, setGetMyInf] = useState<any>(null);
  const [myInfModalVisible, setMyInfModalVisible] = useState(false);
  const [timestampDate, setTimestampDate] = useState<any>(null);

  const showBuyPolicyModal = () => {
    setisBuyPolicyModalVisible(true);
  };

  const handleBuyPolicyCancel = () => {
    setisBuyPolicyModalVisible(false);
  };

  const handleBuyPolicy = async (policyId: any, value: any) => {
    if (contract) {
      try {
        await contract.methods
          .BuyInsurance(policyId)
          .send({ from: account, value: value });
        message.success("保险购买成功");
        setisInfModalVisible(false);
        setisBuyPolicyModalVisible(false);
      } catch (error) {
        console.log(error);
        message.error("保险购买失败");
      }
    } else {
      console.log(contract);
      message.error("智能合约未连接");
    }
  };

  const handleCompensation = async (policyId: any) => {
    if (contract) {
      try {
        await contract.methods
          .claimCompensation(policyId)
          .send({ from: account });
        message.success("保险理赔成功");
        setisInfModalVisible(false);
      } catch (error) {
        console.log(error);
        message.error("保险理赔失败");
      }
    } else {
      console.log(contract);
      message.error("智能合约未连接");
    }
  };

  const handleReturnPolicy = async (policyId: any) => {
    if (contract) {
      try {
        const result = await contract.methods
          .ReturnInsurance(policyId)
          .send({ from: account });
        console.log(result);
        if (result.status) message.success("保险退还成功");
        else message.error("保险退还失败");
        setisInfModalVisible(false);
      } catch (error) {
        console.log(error);
        message.error("保险理赔失败");
      }
    } else {
      console.log(contract);
      message.error("智能合约未连接");
    }
  };

  const handleCreatePolicy = async (values: any) => {
    console.log(values);
    if (contract) {
      try {
        await contract.methods
          .CreateInsurance(
            values.insurance_id,
            values.insurance_name,
            values.purchase_amount,
            values.compensation
          )
          .send({ from: account });
        message.success("保险创建成功");
        setisCreateModalVisible(false);
      } catch (error) {
        console.log(error);
        message.error("保险创建失败");
      }
    } else {
      console.log(contract);
      message.error("智能合约未连接");
    }
  };

  const handleGetPolicy = async (values: any) => {
    if (contract) {
      try {
        const result = await contract.methods
          .getInsurancesPaginated(0, 100)
          .call();
        console.log(result);
        message.success("保险信息获取成功");
        setGetInfResult(result);
        setisInfModalVisible(true);
      } catch (error) {
        console.log(error);
        message.error("保险信息获取失败");
      }
    } else {
      console.log(contract);
      message.error("智能合约未连接");
    }
  };

  const handleMyInsurance = async () => {
    if (contract) {
      try {
        const result = await contract.methods
          .getInsuranceRecord(account)
          .call();
        console.log(result);
        message.success("最新购买信息获取成功");
        setGetMyInf(result);
        const timestamp = new Date(1000 * Number(result?.[1]));
        setTimestampDate(timestamp.toLocaleString());
        setMyInfModalVisible(true);
      } catch (error) {
        console.log(error);
        message.error("最新购买信息获取失败");
      }
    } else {
      console.log(contract);
      message.error("智能合约未连接");
    }
  };

  const handleExpiredInsurance = async () => {
    if (contract) {
      try {
        const result = await contract.methods
          .ExpiredInsurance()
          .call({ from: account });
        console.log(result); // Output the result for debugging
        message.success("保险销毁成功");
      } catch (error) {
        console.log(error);
        message.success("保险销毁成功");
      }
    } else {
      console.log(contract);
      message.error("智能合约未连接");
    }
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      // 检查 MetaMask 是否已安装
      window.web3 = new Web3(window.ethereum);
      try {
        // 请求用户账户地址
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        // 连接成功后设置账户地址
        setAccount(accounts[0]);
        message.success("成功连接到 MetaMask 账户");
      } catch (error) {
        message.error("连接 MetaMask 账户失败");
      }
    } else {
      message.error("请安装 MetaMask!");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {" "}
      {/* 确保 Layout 充满整个视口高度 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="logo">
          <Avatar size="large" icon={<UserOutlined />} /> {/* 这里是头像 */}
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item
            key="5"
            icon={<VideoCameraOutlined />}
            onClick={() => {
              setisV(true);
            }}
          >
            输入合约地址
          </Menu.Item>
          <Menu.Item
            key="1"
            icon={<VideoCameraOutlined />}
            onClick={() => {
              setisCreateModalVisible(true);
            }}
          >
            创建保险产品
          </Menu.Item>
          <Menu.Item
            key="2"
            icon={<UploadOutlined />}
            onClick={handleGetPolicy}
          >
            获取保险产品
          </Menu.Item>
          <Menu.Item
            key="3"
            icon={<UploadOutlined />}
            onClick={handleMyInsurance}
          >
            已购保险记录
          </Menu.Item>
          <Menu.Item
            key="4"
            icon={<UploadOutlined />}
            onClick={handleExpiredInsurance}
          >
            销毁保险产品
          </Menu.Item>
        </Menu>
      </Sider>
      <Modal
        title="输入合约地址"
        visible={isV}
        onCancel={() => {setisV(false)}}
        onOk={() => {
          vform
            .validateFields()
            .then((values) => {
              vform.resetFields();
              setContractAddress(values.contractAddress);
              if (window.ethereum) {
                window.web3 = new Web3(window.ethereum);
                try {
                  const myContract = new window.web3.eth.Contract(
                    contractABI,
                    values.contractAddress
                  );
                  setContract(myContract);
                  console.log(myContract);
                  message.success("成功连接到合约");
                } catch {
                  message.error("合约地址错误");
                }
              } else {
                message.error("请安装 MetaMask!");
              }
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
            
            console.log(contractAddress);
            setisV(false);
        }}
      >
        <Form
          form={vform}
          layout="vertical"
          name="form_in_modal"
          initialValues={{ modifier: "public" }}
        >
          <Form.Item
                        name="contractAddress"
                        label="合约地址"
                        rules={[
                            { required: true, message: "请输入合约地址!" },
                        ]}>
                        <Input />
                    </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="购买保险"
        visible={isBuyPolicyModalVisible}
        onCancel={handleBuyPolicyCancel}
        onOk={() => {
          buyform
            .validateFields()
            .then((values) => {
              buyform.resetFields();
              // handleBuyPolicy(values);
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}
      >
        <Form
          form={buyform}
          layout="vertical"
          name="form_in_modal"
          initialValues={{ modifier: "public" }}
        >
          {/* <Form.Item
                        name="contractAddress"
                        label="保险地址"
                        rules={[
                            { required: true, message: "请输入保险地址!" },
                        ]}>
                        <Input />
                    </Form.Item> */}
          <Form.Item
            name="policyId"
            label="保险政策ID"
            rules={[{ required: true, message: "请输入保险政策ID!" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="创建保险产品"
        visible={isCreateModalVisible}
        onCancel={() => {
          setisCreateModalVisible(false);
        }}
        onOk={() => {
          createform
            .validateFields()
            .then((values) => {
              createform.resetFields();
              handleCreatePolicy(values);
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}
      >
        <Form
          form={createform}
          layout="vertical"
          name="form_in_modal"
          initialValues={{ modifier: "public" }}
        >
          <Form.Item
            name="insurance_id"
            label="保险ID"
            rules={[{ required: true, message: "请输入保险ID!" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="insurance_name"
            label="保险名称"
            rules={[{ required: true, message: "请输入保险名称!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="purchase_amount"
            label="保险金额"
            rules={[{ required: true, message: "请输入保险金额!" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="compensation"
            label="赔付金额"
            rules={[{ required: true, message: "请输入赔付金额!" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="获取保险产品"
        visible={isGetModalVisible}
        onCancel={() => {
          setisGetModalVisible(false);
        }}
        onOk={() => {
          getform
            .validateFields()
            .then((values) => {
              getform.resetFields();
              handleGetPolicy(values);
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}
      >
        <Form
          form={getform}
          layout="vertical"
          name="form_in_modal"
          initialValues={{ modifier: "public" }}
        >
          <Form.Item
            name="start_id"
            label="起始保险ID"
            rules={[{ required: true, message: "请输入起始保险ID!" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="end_id"
            label="终止保险ID"
            rules={[{ required: true, message: "请输入终止保险ID!" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="保险产品信息"
        visible={isInfModalVisible}
        onCancel={() => {
          setisInfModalVisible(false);
        }}
        onOk={() => {
          setisInfModalVisible(false);
        }}
      >
        <Collapse accordion>
          {getInfResult?.map((output: any, index: any) => (
            <Collapse.Panel header={`Index ${index}`} key={index}>
              <p>Insurance ID: {String(output.insurance_id)}</p>
              <p>Insurance Name: {output.insurance_name}</p>
              <p>Purchase Amount: {String(output.purchase_amount)}</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p>Compensation: {String(output.compensation)}</p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p>Is Sold: {output.isSold ? "Yes" : "No"}</p>

                {output.isSold ? (
                  account === String(output.buyer_add).toLowerCase() ? (
                    (output.hasBeenClaimed ? <></> : <Button
                    type="primary"
                    disabled={!output.isSold || output.ifreturned}
                    onClick={() => handleReturnPolicy(output.insurance_id)}
                  >
                    {output.ifreturned ? "已退款" : "保险退款"}
                  </Button>)
                    
                  ) : (
                    <Button
                      type="primary"
                      disabled={output.isSold}
                      onClick={() =>
                        handleBuyPolicy(
                          output.insurance_id,
                          output.purchase_amount
                        )
                      }
                    >
                      已被购买
                    </Button>
                  )
                ) : (
                  <Button
                    type="primary"
                    onClick={() =>
                      handleBuyPolicy(
                        output.insurance_id,
                        output.purchase_amount
                      )
                    }
                  >
                    购买保险
                  </Button>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p>Has Been Claimed: {output.hasBeenClaimed ? "Yes" : "No"}</p>{" "}
                {account === String(output.buyer_add).toLowerCase() ? (
                  (output.ifreturned ? <></> : <Button
                  type="primary"
                  disabled={output.hasBeenClaimed}
                  onClick={() => handleCompensation(output.insurance_id)}
                >
                  {output.hasBeenClaimed ? "已理赔" : "保险理赔"}
                </Button>)
                  
                ) : (
                  <></>
                )}
              </div>
            </Collapse.Panel>
          ))}
        </Collapse>
      </Modal>
      <Modal
        title="最新购买保险产品信息"
        visible={myInfModalVisible}
        onCancel={() => {
          setMyInfModalVisible(false);
        }}
        onOk={() => {
          setMyInfModalVisible(false);
        }}
      >
        <Card>
          <p>Insurance ID: {String(getMyInf?.[0])}</p>
          <p>Purchase Time: {timestampDate}</p>
          <p>Insurance Name: {String(getMyInf?.[2])}</p>
          <p>Purchase Amount: {String(getMyInf?.[3])}</p>
          <p>Compensation: {String(getMyInf?.[4])}</p>
        </Card>
      </Modal>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }}>
        {account ? ((
            <Button
              onClick={connectMetaMask}
              style={{ float: "right", margin: "16px" }}
            >
              切换 MetaMask 账户
            </Button>
          )) : ((
            <Button
              onClick={connectMetaMask}
              style={{ float: "right", margin: "16px" }}
            >
              连接到 MetaMask
            </Button>
          ))}
          {account ? (
            <Text
              style={{
                float: "right",
                margin: "16px",
                color: "black",
              }}
            >
              {account}
            </Text>
          ) : <></>}
          
        </Header>
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%", // 确保 Content 高度充满剩余空间
          }}
        >
          <Title level={2}>欢迎来到基于区块链的保险平台</Title>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CustomLayout;
