commit_message="Automatic_commit_Make_Your_Game"
while true; do 
    # git_status=$(git status --porcelain)
    # if [[ -n "$git_status"]]; then
    #effectuer un commit avec tous les fichiers
        git config --global credential.helper store
        git add -A
        git config --global user.email "foutanketech@gamil.com"
        git config --global user.name "ousmaneba0"
        git commit -m "$commit_message"
        #envoyer les ficher dans la branche master
        git push origin master
    # fi
    #Attendre 5 min avant de refaire le meme processus
    sleep 600
done

