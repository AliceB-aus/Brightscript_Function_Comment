export class ParamDeclaration {

	constructor(public paramName: string, public paramType: string) {
		this.paramName = paramName;
		this.paramType = paramType;
	}
}

//Set the text to add to the file 
//eg 
//  '''''''
//  ' OpenView: 
//  ' 
//  ' @param  {String} viewId=""
//  ' @param  {Object} content=invalid
//  '''''''''
export function getParameterText(paramList: ParamDeclaration[], returnText: string = '', functionName: string = '' ): string {
	var textToInsert: string = "";
    textToInsert = textToInsert + ' \'\'\'\'\'\'\'\n \'' + functionName + ": \n '\n '";
    
	paramList.forEach(element => {
		if (element.paramName !== '') {
			textToInsert = textToInsert + ' @param  ';
			textToInsert = textToInsert + '{' + element.paramType + '}' + ' ';
			textToInsert = textToInsert + element.paramName + '\n' + ' \'';
		}
	});
	if (returnText !== '') {
		textToInsert = textToInsert + ' @returns ' + returnText + '\n' + ' \'';
	}
	textToInsert = textToInsert + '\'\'\'\'\'\'\'\'';
	return textToInsert;
}

// Get the return type 
export function getReturns(text : string ): string {
	var returnText: string = '';
	text = text.replace(/\s/g, '');

    // check if a return type in avaiable by comparing indexs 
    var lastBrace = text.lastIndexOf(')');
    var lastAs = text.lastIndexOf('as');

	if (lastBrace < lastAs) {
		//we have a return type
		//read from after the as to the end of string 
        var index = lastAs + 2;

        var splicedText = text.slice(index, text.length);
        if ( splicedText === null) { return ""; }
        returnText = splicedText;
    }

    return returnText;
}

//strip any comments out of the text 
//since brightscript has no end comment it will stop on the first '
export function stripComments(text: string): string {
	var uncommentedText: string = '';
	var index = 0;
	while (index !== text.length) {
		// if the letter is a '
		if ((text.charAt(index) === '\'') ) {
			// we have hit comment. scrap the rest of the text 
            index = text.length;
		}
		else {
			uncommentedText = uncommentedText + text.charAt(index);
			index++;
		}
	}
	return uncommentedText;
}

	
//Assumes that the string passed in continues to ) and does not contain any comments
export function getParameters(text: string): ParamDeclaration[] {
	var paramList: ParamDeclaration[] = [];
	//start by removing spaces 
	var index = 0;
    text = text.replace(/\s/g, '');

    //Now we are at the first non whitespace character
    //count the number of matching opening and closing braces. Keep parsing until 0
    var numBraces = 1;
    while ((numBraces !== 0) && (index !== text.length)) {
        //console.log('start loop current index ' + text[index] );

        //Now we are at a non whitespace character. Assume it is the parameter name
        var name: string = '';
        //check if the function has no params 
        if (text.charAt(index) === ')') {
        //    console.log("No params to parse" )
            return paramList;
        }
        // get all the text until the name has ended 
        while (((text.charAt(index) !== 'a') || (text.charAt(index+1) !== 's')) // as and hence param type
        && (text.charAt(index) !== ',') // no param type
        && (text.charAt(index) !== ')') // end of function with no param type 
        && (index < text.length) ){ // end of string 
            name = name + text.charAt(index);
            index++;
        }
        // if there is no param type after the param name 
        if(text.charAt(index) == ','  || text.charAt(index) == ')'){
        //    console.log("We hit a ',' or ')'" )
            type = '';

        } 
        
        else if (index < text.length) {	
        // get the param type 	
            //skip the 'as' 
            index++;
            index++;

            var type: string = '';

            // Get all the text until a ',' or ')' to get the param type
            while ((text.charAt(index) !== ',') && (text.charAt(index) !== ')') && (index !== text.length)) {
                type = type + text.charAt(index);
                index++;
            }
            // If we hit a ')' we are done and should exit the while loop 
            if (text.charAt(index) === ')') {
                numBraces--;
            }
        }	
        else {
            //no type is specified 
            type = '';
        }

        // put the parameter in the list 
        paramList.push(new ParamDeclaration(name, type));
        // jump over the ',' or ')' for the next param 
        if (index < text.length) {
            index++;
        }
    }
    
	return paramList;
}