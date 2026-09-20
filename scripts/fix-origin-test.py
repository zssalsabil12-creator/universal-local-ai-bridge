p=r"C:\Users\PC\ulab\agent\test\security.test.ts"
lines=open(p,encoding="utf-8").readlines()
out=[]
for line in lines:
    if "chrome-extension://abcdefghijklmnop" in line:
        out.append("    assert(agentServer.isOriginAllowed('chrome-extension://abcdefghijklmnop') === false, 'Reject retired Chrome extension origin');\n")
    else:
        out.append(line)
open(p,"w",encoding="utf-8").writelines(out)
