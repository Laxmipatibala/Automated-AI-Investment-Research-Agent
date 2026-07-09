import java.util.*;
import java.io.*;
import java.lang.*;


interface A{
    void methA();
}

interface B{
    void methB();
}

class c implements A,B{
    public void methA(){
        System.out.println("A");
    }
    public void methB(){
        System.out.println("B");
    }
}


class Main{
    public static void main(String[] args){
        c obj=new c();
        obj.methA();
        obj.methB();jjgghgj
    }
}