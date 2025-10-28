import os
path = "."
result = [] # list of all files and folders in the directory
def walk(path):
  for item in os.listdir(path):
    item_path = os.path.join(path, item) # capture the path of the current item
    if os.path.isfile(item_path):
      result.append(item_path)
    else:
        walk(item_path)
walk(path)
print(result)