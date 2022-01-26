regex="@playwright/test@(.+)"
result="$(yarn list --pattern "@playwright/test" --depth=0 | grep playwright/test)"
if [[ $result =~ $regex ]]
then
  echo "::set-output name=version::${BASH_REMATCH[1]}"
else
  echo "Unable to find '@playwright/test' version"
  exit 1
fi
