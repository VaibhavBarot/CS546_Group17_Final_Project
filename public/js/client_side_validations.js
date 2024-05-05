document.addEventListener('DOMContentLoaded',function(){
    const $ = window.jQuery;
    const signup_form = document.getElementById('signup-form')
    const signin_form = document.getElementById('signin-form')
    const create_manager_signup_form = document.getElementById('create-manager-signup-form')
    const create_devtest_signup_form = document.getElementById('create-devtest-signup-form')
    const reset_password = document.getElementById('reset-password')
    const dashboard = document.getElementById('dashboard');
    const create_bug_form = document.getElementById('createBug-form');
    const bugDetails = document.getElementById('bug-details-form');

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
            const errorDiv = document.getElementById('error')
            if(errorDiv){
                errorDiv.innerHTML = ''
            }
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
                if(!errorDiv){
                    errorDiv = document.createElement('div')
                    errorDiv.setAttribute('id','error')
                    errorDiv.classList.add('alert')
                    errorDiv.classList.add('alert-danger');
                    document.getElementById('container').appendChild(errorDiv)
                }
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
                const errorDiv = document.getElementById('error')
                if(errorDiv){
                    errorDiv.innerHTML = ''
                }
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
                    if(!errorDiv){
                        errorDiv = document.createElement('div')
                        errorDiv.setAttribute('id','error')
                        errorDiv.classList.add('alert')
                        errorDiv.classList.add('alert-danger');
                        document.getElementById('container').appendChild(errorDiv)
                    }
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
        if(create_manager_signup_form){
            create_manager_signup_form.addEventListener('submit',function(event){
                let errors = [];
                const errorDiv = document.getElementById('error')
                if(errorDiv){
                    errorDiv.innerHTML = ''
                }
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
                    if(!errorDiv){
                        errorDiv = document.createElement('div')
                        errorDiv.setAttribute('id','error')
                        errorDiv.classList.add('alert')
                        errorDiv.classList.add('alert-danger');
                        document.getElementById('container').appendChild(errorDiv)
                    }
                    errorDiv.classList.remove('invisible');
                    errorDiv.innerHTML = ''
                    return errors.forEach(error => {
                        let p = document.createElement('p')
                        p.innerText = error;
                        errorDiv.appendChild(p);
                    })
                }
                create_manager_signup_form.submit()
               
               })
        }

        if(create_devtest_signup_form){
            create_devtest_signup_form.addEventListener('submit',function(event){
                let errors = [];
                const errorDiv = document.getElementById('error')
                if(errorDiv){
                    errorDiv.innerHTML = ''
                }
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
                    if(!errorDiv){
                        errorDiv = document.createElement('div')
                        errorDiv.setAttribute('id','error')
                        errorDiv.classList.add('alert')
                        errorDiv.classList.add('alert-danger');
                        document.getElementById('container').appendChild(errorDiv)
                    }
                    errorDiv.classList.remove('invisible');
                    errorDiv.innerHTML = ''
                    return errors.forEach(error => {
                        let p = document.createElement('p')
                        p.innerText = error;
                        errorDiv.appendChild(p);
                    })
                }
                create_devtest_signup_form.submit()
               
               })
        }

        if(dashboard){
            $('.delete-button').each(function() {
                const projectId = $(this).attr('data-id')
                $(this).on('click', (ev) => {
                    $.ajax({
                        method:'DELETE',
                        url:`http://localhost:3000/projects/${projectId}`,
                        data: {_id:projectId}
                    })
                    .done(() => window.location.reload)
                })
            })

            $('#search').on('click', (ev) => {
                const searchText = $('#event-name').val();
                // do error handling
                $.post('http://localhost:3000/projects/searchprojects', {searchText:searchText}, (data) => {
                    $('#softwares').empty();
                    data.forEach((project) => {
                        $('#softwares').append(`<div class="card text-center text-bg-secondary mb-3">
                            <div class="card-header h3">
                                ${project.name}
                            </div>
                            <div class="card-body">
                                <p class="card-text">${project.description}</p>
                                <a href="/projects/${project._id}/bugs" class="btn btn-lg btn-primary">View</a>
                            </div>
                        </div>`)
                    })
                })
            })
        }

        if(reset_password){
            reset_password.addEventListener('submit',function(event){
                let errors = []
                event.preventDefault();
                try{
                    oldPassword = document.getElementById('oldPassword').value.trim()
                    oldPassword = client_validations.checkString(oldPassword,'Old Password')
                    client_validations.checkPassword(oldPassword,'Old Password')
                }
                catch(e){
                    errors.push(e)
                }
                try{
                    newPassword = document.getElementById('newPassword').value.trim()
                    newPassword = client_validations.checkString(newPassword,'New Password')
                    client_validations.checkPassword(newPassword,'New Password')
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
                reset_password.submit()
                // $('#reset-password').on('submit', (ev) => {
                //     $.ajax({
                //         type: 'PATCH',
                //         url: 'http://localhost:3000/firstLogin',
                //         data: JSON.stringify({email:email,oldPassword:oldPassword,newPassword:newPassword}),
                //         processData: false,
                //         contentType: 'application/merge-patch+json',                    
                //      })
                // })
            })
        }
        
        if(bugDetails){
            $('#edit-details').on('click', (ev) =>{
                $.get('http://localhost:3000/getcurrentuserrole', function(role) {
                    if(role){
                        $('.form-control').each(function() {
                            const id = $(this).attr('id')
                            if(id === 'title' || id === 'description' || id === 'submit-button') $(this).removeAttr('disabled');

                            if(role === 'developer' || role === 'tester' || role === 'manager'){
                                if(id === 'status' || id === 'priority' || id === 'estimatedtime') $(this).removeAttr('disabled');
                            }

                            if(role === 'manager'){
                                if(id === 'assignedto') $(this).removeAttr('disabled');
                            }

                        })
                    }
                })
            })

            // $('#submit-button').on('click', (ev) => {
            //     let req = {};

            //     $('.form-control').each(function (control){
            //         const id = $(this).attr('id');
            //         if(id !== 'submit-button' && id !== 'addcomment'){
            //             req[id] = $(this).val();
            //         }
            //     })
            // })

            $('#comment-form').on('submit', (ev) =>{
                $('#comment-form').attr('action',window.location.href+'/addcomment')
                const comment = $('#addcomment-text').val().trim();
                const files = $('#fileupload').val()
                if(comment !== ''){

                }
            })
        }

});