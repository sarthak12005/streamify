import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";



const useLogin = () => {
    const queryClient = useQueryClient();
    const { mutate: loginMutation, isPending, error } = useMutation({
        mutationFn: login,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        }
    })

    return { loginMutation, isPending, error};
};

export default useLogin;