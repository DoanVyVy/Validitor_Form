function Validator(options){

    function getParent(element, selector){
        while (element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    let selectorRules = {};

    function validate(inputElement, rule){
        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        let errorMessage;
        let rules = selectorRules[rule.selector];
        for(let i = 0; i < rules.length; i++){
            errorMessage = rules[i](inputElement.value);
            if(errorMessage){
                break;
            }
        }
            if(errorMessage){
                errorElement.innerText = errorMessage;
                getParent(inputElement, options.formGroupSelector).classList.add('invalid');
            }else{
                errorElement.innerText = '';
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
            }
        return !errorMessage;
    }

    let formElement = document.querySelector(options.form);

    if (formElement){
        formElement.onsubmit = function(e){
            e.preventDefault();
            let isFormValid = true;
            options.rules.forEach(function (rule){
                let inputElement = formElement.querySelector(rule.selector);
                let isValid = validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }
            });
            if(isFormValid){
                if(typeof options.onsubmit === 'function'){
                    let enableInputs = formElement.querySelectorAll('[name] ');
                    let formValues = Array.from(enableInputs).reduce(function(values, input){
                        values[input.name] = input.value;
                        return values;
                    }, {});
                    options.onsubmit(formValues);
                }else{
                    formElement.submit();
                }
            }
        }
        options.rules.forEach(function (rule){  
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }else{
                selectorRules[rule.selector] = [rule.test];
            }
            let inputElement = formElement.querySelector(rule.selector);
            if (inputElement){
                inputElement.onblur = function(){
                    validate(inputElement, rule);
                }
                inputElement.oninput = function(){
                    let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            }
        });
    }
}

Validator.isRequired = function(selector, message){
    return{
        selector: selector,
        test: function(value){
            return value.trim() ? undefined : message || 'Vui l??ng nh???p tr?????ng n??y'
        }
    };
}

Validator.isEmail = function(selector, message){
    return{
        selector: selector,
        test: function(value){
            let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Tr?????ng n??y ph???i l?? email';
        }
    };
}

Validator.minLength = function(selector, min, message){
    return{
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : message || `Vui l??ng nh???p t???i thi???u ${min} k?? t???`;
        }
    }; 
}

Validator.isConfirmed = function(selector, getConfirmValue, message){
    return{
        selector: selector,
        test: function(value){
            return value === getConfirmValue() ? undefined : message || 'Gi?? tr??? nh???p v??o kh??ng ch??nh x??c';
        }
    };
}