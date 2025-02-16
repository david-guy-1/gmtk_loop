while(True):
    print("enter the class name")
    name = input()
    print("enter the vars and types in the format var1:type1`var2:type2`... - default is number") 
    x  =input()
    vars_= []
    types = []
    for item in x.split("`"):
        try:
            v,t = item.split(":")
        except ValueError:
            v = item
            t = "number"
        vars_.append(v)
        types.append(t)
    init_data = ""
    cons_data = ""
    assign_data = ""
    for v,t in zip(vars_, types):
        init_data += f"    {v}:{t};\n"
        cons_data += f"{v} : {t},"
        assign_data += f"        this.{v}={v};\n"
    cons_data = cons_data[0:len(cons_data)-1]
    out = f"""class {name} {{
{init_data}
    constructor({cons_data}){{
{assign_data}
    }}
}}
export default {name};
"""
    print(out)
