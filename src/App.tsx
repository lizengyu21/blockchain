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
const contractAddress = "0xdb2aff4D86cFeDB39015b4792e50c0DD14AA44bD";

const CustomLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState<any>(null);
    const [isBuyPolicyModalVisible, setisBuyPolicyModalVisible] =
        useState(false);
    const [buyform] = Form.useForm();

    const [isCreateModalVisible, setisCreateModalVisible] =
        useState(false);
    const [createform] = Form.useForm();
    const [isGetModalVisible, setisGetModalVisible] =
        useState(false);
    const [getform] = Form.useForm();

    const showBuyPolicyModal = () => {
        setisBuyPolicyModalVisible(true);
    };

    const handleBuyPolicyCancel = () => {
        setisBuyPolicyModalVisible(false);
    };

    const handleBuyPolicy = async (values: any) => {
        console.log(values);
        if (contract) {
            try {
                const address = window.web3?.utils.numberToHex(
                    values.contractAddress
                );
                console.log(address);
                await contract.methods
                    .buyPolicy(address, values.policyId)
                    .send({ from: account });

                message.success("保险购买成功");
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

    const handleCreatePolicy = async (values: any) => {
        console.log(values);
        message.success("创建保险产品成功");
        if (contract) {
            try {
                await contract.methods.CreateInsurance(
                  values.insurance_id, 
                  values.insurance_name,  
                  values.purchase_amount,
                  values.compensation
                ).send({ from: account });
                
            } catch (error) {
                console.log(error);
                message.error("保险创建失败");
            }
        }
    };

    const handleGetPolicy = async (values: any) => {
      message.success("获取保险产品成功");
      if (contract) {
          try {
            const result = await contract.methods.getInsurancesPaginated(
                values.start_id, 
                values.end_id
              ).call();
            console.log(result);
          } catch (error) {
              console.log(error);
              message.error("保险获取失败");
          }
      }
  };

    const handleMouseEnter = () => {
      setCollapsed(false);
    };
  
    const handleMouseLeave = () => {
      setCollapsed(true);
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
                const myContract = new window.web3.eth.Contract(
                    contractABI,
                    contractAddress
                );
                setContract(myContract);
                console.log(myContract);
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
            <Sider trigger={null} collapsible collapsed={collapsed} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="logo">
                    <Avatar size="large" icon={<UserOutlined />} />{" "}
                    {/* 这里是头像 */}
                </div>
                <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
                    <Menu.Item
                        key="1"
                        icon={<UserOutlined />}
                        onClick={showBuyPolicyModal}>
                        购买保险
                    </Menu.Item>
                    <Menu.Item key="2" icon={<VideoCameraOutlined /> } onClick={() => {setisCreateModalVisible(true)}}>
                        创建保险产品
                    </Menu.Item>
                    <Menu.Item key="3" icon={<UploadOutlined />} onClick={() => {setisGetModalVisible(true)}}>
                        获取保险产品
                    </Menu.Item>
                </Menu>
            </Sider>
            <Modal
                title="购买保险"
                visible={isBuyPolicyModalVisible}
                onCancel={handleBuyPolicyCancel}
                onOk={() => {
                    buyform.validateFields()
                        .then((values) => {
                            buyform.resetFields();
                            handleBuyPolicy(values);
                        })
                        .catch((info) => {
                            console.log("Validate Failed:", info);
                        });
                }}>
                <Form
                    form={buyform}
                    layout="vertical"
                    name="form_in_modal"
                    initialValues={{ modifier: "public" }}>
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
                        rules={[
                            { required: true, message: "请输入保险政策ID!" },
                        ]}>
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="创建保险产品"
                visible={isCreateModalVisible}
                onCancel= {() => {
                    setisCreateModalVisible(false);
                }}
                onOk={() => {
                    createform.validateFields()
                        .then((values) => {
                            createform.resetFields();
                            handleCreatePolicy(values);
                        })
                        .catch((info) => {
                            console.log("Validate Failed:", info);
                        });
                }}>
                <Form
                    form={createform}
                    layout="vertical"
                    name="form_in_modal"
                    initialValues={{ modifier: "public" }}>
                    <Form.Item
                        name="insurance_id"
                        label="保险ID"
                        rules={[
                            { required: true, message: "请输入保险ID!" },
                        ]}>
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        name="insurance_name"
                        label="保险名称"
                        rules={[
                            { required: true, message: "请输入保险名称!" },
                        ]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="purchase_amount"
                        label="保险金额"
                        rules={[
                            { required: true, message: "请输入保险金额!" },
                        ]}>
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        name="compensation"
                        label="赔付金额"
                        rules={[
                            { required: true, message: "请输入赔付金额!" },
                        ]}>
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="获取保险产品"
                visible={isGetModalVisible}
                onCancel= {() => {
                    setisGetModalVisible(false);
                }}
                onOk={() => {
                    getform.validateFields()
                        .then((values) => {
                          getform.resetFields();
                            handleGetPolicy(values);
                        })
                        .catch((info) => {
                            console.log("Validate Failed:", info);
                        });
                }}>
                <Form
                    form={getform}
                    layout="vertical"
                    name="form_in_modal"
                    initialValues={{ modifier: "public" }}>
                    <Form.Item
                        name="start_id"
                        label="起始保险ID"
                        rules={[
                            { required: true, message: "请输入起始保险ID!" },
                        ]}>
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        name="end_id"
                        label="终止保险ID"
                        rules={[
                            { required: true, message: "请输入终止保险ID!" },
                        ]}>
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
            <Layout className="site-layout">
                <Header
                    className="site-layout-background"
                    style={{ padding: 0 }}>
                    {account ? (
                        <Text
                            style={{
                                float: "right",
                                margin: "16px",
                                color: "black",
                            }}>
                            {account}
                        </Text>
                    ) : (
                        <Button
                            onClick={connectMetaMask}
                            style={{ float: "right", margin: "16px" }}>
                            连接到 MetaMask
                        </Button>
                    )}
                </Header>
                <Content
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%", // 确保 Content 高度充满剩余空间
                    }}>
                    <Title level={2}>欢迎来到基于区块链的保险平台</Title>
                </Content>
            </Layout>
        </Layout>
    );
};

export default CustomLayout;
