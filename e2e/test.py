# # import os

# # results = []
# # results += [each for each in os.listdir('tests') if each.endswith('.test.ts')]

# # print(results)

# import os, glob, json
# os.chdir('e2e/tests')
# files = glob.glob('**/*.test.ts', recursive=True)
# print(f"::set-output name=json::{json.dumps(files)}")

# import re, os

# # yarn list --pattern "@playwright/test" --depth=0

# # result = """
# # yarn list v1.22.10
# # └─ @playwright/test@1.18.0
# # ✨  Done in 0.50s.
# # """

# # version = re.search("@playwright\/testt@(.+)", txt)

# # if (version):
# #   print(version.group(1))
# # else:
# #   raise Exception("Unable to read @playwright/test version")


# lockFile = os.read('yarn.lock');

# print(lockFile)

# # version = re.search("@playwright\/testt@(.+)", lockFile)

# # if (version):
# #   print(version.group(1))
# # else:
# #   raise Exception("Unable to read @playwright/test version")

# RESULT="$(yarn list --pattern "@playwright/test" --depth=0)"
# RESULT="${RESULT//'%'/'%25'}"
# RESULT="${RESULT//$'\n'/'%0A'}"
# RESULT="${RESULT//$'\r'/'%0D'}"
# echo "::set-output name=RESULT::$(echo "$RESULT")"


# regex="@playwright\/testt@(.+)"
# result = "
# yarn list v1.22.10
# └─ @playwright/test@1.18.0
# ✨  Done in 0.50s.
# "

# if [[ $result =~ $regex ]]
# then
#     echo "match"
#     name="${BASH_REMATCH[1]}"
# else
#     echo "$f doesn't match" >&2 # this could get noisy if there are a lot of non-matching files
# fi
