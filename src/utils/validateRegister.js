import validateEmail from "./validateEmail";

const validateRegister = (registerInput) => {
    if(!registerInput.email || !validateEmail(registerInput.email)){
        return[{
            field: 'email',
            message: 'Email is incorect'
        }]
    }
    
    if(registerInput.username.length < 7){
        return[{
            field: 'username', 
            message: 'Username must be more than 7 characters.'
        }]
    }

    if(registerInput.password.length < 10){
        return[{ 
            field: 'username', 
            message: 'Username must be more than 10 characters.'
        }]
    }

    return null;
}
export default validateRegister