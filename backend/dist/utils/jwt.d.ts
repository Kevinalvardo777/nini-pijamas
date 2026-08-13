export declare const signToken: (payload: object) => string;
export declare const verifyToken: (token: string) => {
    userId: string;
    role: string;
};
