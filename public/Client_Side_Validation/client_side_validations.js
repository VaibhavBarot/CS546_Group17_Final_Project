document.addEventListener('DOMContentLoaded',function(){
    const signup_form = document.getElementById('signup-form')
    const signin_form = document.getElementById('signin-form')
    const admin_manager_signup_form = document.getElementById('admin-manager-signup-form')
    const manager_devtest_signup_form = document.getElementById('manager-devtest-signup-form')

    const client_validations = {
  
        checkString(strVal, varName, ) {
          if (!strVal) throw `Error: You must supply ${varName}!`;
          if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
          strVal = strVal.trim();
          if (strVal.length === 0)
            throw `Error: ${varName} cannot be an empty string or string with just spaces`;
          if (!isNaN(strVal))
            throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
          return strVal;
        },
      
      
        checkName(strVal, varName){
          if(strVal.length < 2 || strVal.length > 25 || /\d/.test(strVal)) throw `Invalid ${varName} `
        },

        checkPassword(strVal, varName){
            if(strVal.length < 8 ) throw `Error: ${varName} must be of 8 characters minimum`
            const password_regex =  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
            if(!password_regex.test(strVal)){
                throw `Error: Invalid Password format ${varName} . Password must contain at least one number and there has to be at least one special character`
            }
          },
        
          checkEmail(email){
            if(!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))) throw "Error: Invalid email address";
          },
          
          checkUser(user){
            let {fname,lname,email,password,role} = user;
            fname = this.checkString(fname, 'First Name');
            this.checkName(fname);
            lname = this.checkString(lname, 'Last Name');
            this.checkName(lname);
            email = this.checkString(email, 'Email');
            //this.checkEmail(email);
            password = this.checkString(password, 'Password');
            role = this.checkString(role, 'Role');
        
            return {fname,lname,email,password,role};
          },
        };

        if(signup_form)
        {
           signup_form.addEventListener('submit',function(event){
            let errors = [];
            event.preventDefault();

            try{
                firstName = document.getElementById('fname').value.trim()
                firstName = client_validations.checkString(firstName,'First Name',errors)
                client_validations.checkName(firstName, 'First Name')
            } catch(e){
                errors.push(e)
            }
            try{
                lastName = document.getElementById('lname').value.trim()
                lastName = client_validations.checkString(lastName,'Last Name')
                client_validations.checkName(lastName,'Last Name')
            }catch(e){
                errors.push(e)
            }
        try{
                email = document.getElementById('email').value.trim().toLowerCase()
                email = client_validations.checkString(email,'Email')
                client_validations.checkEmail(email)
        }
        catch(e){
            errors.push(e)
        }
        try{

                password = document.getElementById('password').value.trim()
                password = client_validations.checkString(password,'password')
                client_validations.checkPassword(password,'Password')

                
            }
            catch(e)
            {
                errors.push(e)
            }
         try{
            confirmPassword = document.getElementById('confirmPassword').value.trim()
            if(confirmPassword !== password){
                throw "Error: Password does not match"
            }
         }  
         catch(e)
         {
            errors.push(e)
         } 
            if(errors.length > 0){
                let errorDiv = document.getElementById('error');
                errorDiv.classList.remove('invisible');
                errorDiv.innerHTML = ''
                return errors.forEach(error => {
                    let p = document.createElement('p')
                    p.innerText = error;
                    errorDiv.appendChild(p);
                })
            }
            signup_form.submit()
           
           })
        }

        if(signin_form)
        {
            signin_form.addEventListener('submit',function(event){
                let errors = [];
                event.preventDefault();
                try{
                    email = document.getElementById('email').value.trim().toLowerCase()
                    email = client_validations.checkString(email,'Email')
                client_validations.checkEmail(email)
                }
                catch(e)
                {
                    errors.push(e)
                }
                try{
                    password = document.getElementById('password').value.trim()
                    password = client_validations.checkString(password,'password')
                    client_validations.checkPassword(password,'Password')
                }
                catch(e){
                    errors.push(e)
                }
                if(errors.length > 0){
                    let errorDiv = document.getElementById('error');
                    errorDiv.classList.remove('invisible');
                    errorDiv.innerHTML = ''
                    return errors.forEach(error => {
                        let p = document.createElement('p')
                        p.innerText = error;
                        errorDiv.appendChild(p);
                    })
                }
                signin_form.submit();
            })
        }

});