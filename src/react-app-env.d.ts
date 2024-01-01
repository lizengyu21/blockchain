/// <reference types="react-scripts" />
// react-app-env.d.ts 或其他 .d.ts 文件

// 扩展 Window 接口
interface Window {
    ethereum?: {
        isMetaMask?: true;
        request: (...args: any[]) => Promise<any>;
    };
}
