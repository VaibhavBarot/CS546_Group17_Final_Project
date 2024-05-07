import os
import psycopg2
import psycopg2.extras
import tabulate
from dotenv import load_dotenv
import pandas as pd
import re
v = ["cust","month"]
f=[['0_count_quant'],['1_sum_quant','1_count_quant'],['2_count_quant']]
s =["prod","cust","0_avg_quant",'1_count_quant','2_max_quant']
n = 2
where_conditions = [[],['cust = cust and month = month'],['cust != cust and month != month']]
# where_conditions = [['cust = cust and month = month'],['cust = cust and month = 0'],['prod = prod and month = month and state = NJ']]
# user_columns = ["prod","month",'1_avg_quant',"1_sum_quant",'2_sum_quant','2_max_month','2_count_quant']
# print(user_columns)
comparison_operators = []
having = []
h_table = {}


def magic_condition(variable_one,string_operator,variable_two):
    
    

    ops = {
        '>': lambda a, b: a > b,
        '<': lambda a, b: a < b,
        '=': lambda a, b: a == b,
        '>=': lambda a, b: a >= b,
        '<=': lambda a, b: a <= b,
        '!=': lambda a,b: a!=b,
    }
    return ops[string_operator](variable_one,variable_two)

def cal_agg(input_func_str,output_dict,value,columns):
    temp = input_func_str.split('_')
    cols = temp[2]

    if 'sum' in temp or 'avg' in temp:
        output_dict[f'{temp[0]}_sum_{temp[2]}'] += value[cols]

    if 'count' in temp or 'avg' in temp:
            output_dict[f'{temp[0]}_count_{temp[2]}'] +=1

    if 'max' in temp:
            if output_dict[input_func_str] < value[cols]:
                output_dict[input_func_str] = value[cols]

    if 'min' in temp:
            if output_dict[input_func_str] > value[cols]:
                output_dict[input_func_str] = value[cols]

    if 'avg' in temp:
            output_dict[input_func_str] = round(output_dict[f'{temp[0]}_sum_{temp[2]}'] / output_dict[f'{temp[0]}_count_{temp[2]}'],2)


def check_single_cond(group,cond,row,columns,group_data):
    
    split_cond = split_on_comparison_operators(cond)
    if '_' in split_cond[2]:
        var2 = h_table[group][split_cond[2]]
        return magic_condition(row[columns[split_cond[0]]],split_cond[1],var2)    
        
    elif split_cond[0] in split_cond[2]:
        # if '!=' in split_cond[1]:

        if '-' in split_cond[2]:
            arithmatic_split = split_cond[2].split(' - ')
            return magic_condition(group_data[split_cond[0]],split_cond[1],row[columns[arithmatic_split[0]]] - int(arithmatic_split[1]))
        elif '+' in split_cond[2]:
            arithmatic_split = split_cond[2].split(' + ')
            return magic_condition(group_data[split_cond[0]],split_cond[1],row[columns[arithmatic_split[0]]] + int(arithmatic_split[1]))
        
        
        return magic_condition(group_data[split_cond[0]],split_cond[1],row[columns[split_cond[2]]])

    

    return magic_condition(group_data[split_cond[0]],split_cond[1],can_be_int(split_cond[2]))
        
        



def split_on_comparison_operators(input_string):
    pattern = re.compile(r'([^=!<>]+)(=|!=|<|>|<=|>=)([^=!<>]+)')
    results = []
    for match in pattern.findall(input_string):
        results.append( match[0].strip())
        results.append(match[1])
        results.append(match[2].strip())
        
        
    
    return results

def can_be_int(input_str):
    try:
        return int(input_str)
        
    except ValueError:
        return input_str 
  

def query():
    load_dotenv()

    user = os.getenv('USER')
    password = os.getenv('PASSWORD')
    dbname = os.getenv('DBNAME')
    

    conn = psycopg2.connect("dbname="+dbname+" user="+user+" password="+password,
                            cursor_factory=psycopg2.extras.DictCursor)
    
    def fetchData():
        columns = {}
        cur = conn.cursor()
        cur.execute("SELECT * FROM sales")
        temp = [desc[0] for desc in cur.description]

        for i in range(len(temp)):
            columns[temp[i]] = i
        return cur,columns
    condition = f''
    for i in (range(n+1)):
        data,columns = fetchData()
        for row in data:
            global takeRow
            for j in range(len(v)):
                condition += f'{row[columns[v[j]]]}'
            
        
            if i == 0:
                if condition not in h_table:
                    h_table[condition] = {'data':[]}
                temp_dict = {}
                for key,col in columns.items():
                    temp_dict[key] = row[col]
                h_table[condition]['data'].append(temp_dict)
            
            
            for func_str in f[i]:
                    if 'avg' in func_str:
                        (gv,func,attribute) = func_str.split('_')
                        if f'{gv}_sum_{attribute}' not in h_table[condition]:
                            h_table[condition][f'{gv}_sum_{attribute}'] = 0
                        if f'{gv}_count_{attribute}' not in h_table[condition]:
                            h_table[condition][f'{gv}_count_{attribute}'] = 0
                    if func_str not in h_table[condition]:
                        h_table[condition][func_str] = 0 
            

            # if h_table[condition][f[i][0]] and h_table[condition][f[i][0]] > 0 and i!=0:
            #     condition = ''
            #     continue

            for func_str in f[i]:
                if i!=0:
                    if h_table[condition][func_str] > 0:
                        condition = ''
                        break
            
            if condition == '':continue

            if i !=0:
                for groups in h_table:
                    if len(h_table[groups]['data']) > 0:
                        for group_data in h_table[groups]['data']:
                
                            conditions = where_conditions[i]
                            takeRow = True
                        
                            for cond in conditions:
                                multi_and_cond = []
                                multi_or_cond = []
                                if 'and' in cond:
                                    multi_and_cond = cond.split('and')
                                elif 'or' in cond:
                                    multi_or_cond = cond.split('or')
                                else:
                                    if not check_single_cond(condition,cond,row,columns,group_data):
                                        takeRow = False
                                if len(multi_or_cond)>0:
                                    for or_cond in multi_or_cond:
                                        if check_single_cond(condition,or_cond,row,columns,group_data):
                                            takeRow = True
                                            break
                                if len(multi_and_cond)>0:
                                    for and_cond in multi_and_cond:
                                        if not check_single_cond(condition,and_cond,row,columns,group_data):
                                            takeRow = False
                                            break
                
                            if takeRow:
                                for func_str in f[i]:
                                    cal_agg(func_str,h_table[condition],group_data,columns)
            if i == 0:
                cal_agg(func_str,h_table[condition],row,columns)
            
            
            condition = f''
    remove_groups = set()   
    for clause in having:
        clause = split_on_comparison_operators(clause)
        for group in h_table:
            
            if not magic_condition(h_table[group][clause[0]],clause[1],can_be_int(clause[2])):
               remove_groups.add(group)

    # print(remove_groups)    
    for group in remove_groups:      
        del h_table[group]
    


    data_rows = []
    for key, inner_dict in h_table.items():
        # del inner_dict['data']
        temp_dict = {}
        for k,val in inner_dict.items():
            if k in s:
                temp_dict[k] = val
        row_dict = {'Groups': key}
        # row_dict = {}
        row_dict.update(temp_dict)
        data_rows.append(row_dict)

    df = pd.DataFrame(data_rows)


            
            


            

    return df



    

        
            
              





def main():
    # query()
    query()
    print(h_table['Emily10'])
    pass
    
if "__main__" == __name__:
    main()